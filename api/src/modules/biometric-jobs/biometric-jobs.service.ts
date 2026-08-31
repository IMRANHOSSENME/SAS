import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiometricJob } from '../../database/entities/biometric-job.entity';
import { Device } from '../../database/entities/device.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { User } from '../../database/entities/user.entity';
import { CreateBiometricJobDto, JobResultDto } from './dto/biometric-job.dto';

@Injectable()
export class BiometricJobsService {
  constructor(
    @InjectRepository(BiometricJob)
    private biometricJobRepo: Repository<BiometricJob>,
    @InjectRepository(Device)
    private deviceRepo: Repository<Device>,
    @InjectRepository(Biometric)
    private biometricRepo: Repository<Biometric>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async createJob(adminId: string, dto: CreateBiometricJobDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const device = await this.deviceRepo.findOne({ where: { id: dto.deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    if (dto.type === 'UPDATE' && !dto.oldFingerprintId) {
      throw new BadRequestException('oldFingerprintId is required for UPDATE job');
    }

    // Check if device is already busy
    if (device.mode !== 'LISTENING') {
      throw new BadRequestException(`Device is currently in ${device.mode} mode. Wait for it to finish.`);
    }

    // Create the job
    const job = this.biometricJobRepo.create({
      userId: dto.userId,
      deviceId: dto.deviceId,
      type: dto.type,
      oldFingerprintId: dto.oldFingerprintId,
      status: 'PENDING',
      requestedBy: adminId,
      requestedAt: new Date(),
      expiresAt: new Date(Date.now() + 15 * 60000), // 15 mins expiry
    });
    await this.biometricJobRepo.save(job);

    // Update device mode
    device.mode = dto.type;
    device.modeChangedAt = new Date();
    device.modeChangedBy = adminId;
    device.modeOperationId = job.id;
    await this.deviceRepo.save(device);

    return job;
  }

  async findAll() {
    return this.biometricJobRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const job = await this.biometricJobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async cancelJob(id: string) {
    const job = await this.biometricJobRepo.findOne({ where: { id } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status === 'COMPLETED' || job.status === 'CANCELLED') {
      throw new BadRequestException(`Job is already ${job.status}`);
    }

    job.status = 'CANCELLED';
    await this.biometricJobRepo.save(job);

    // Reset device
    const device = await this.deviceRepo.findOne({ where: { modeOperationId: id } });
    if (device) {
      device.mode = 'LISTENING';
      device.modeOperationId = '';
      await this.deviceRepo.save(device);
    }

    return job;
  }

  async handleDeviceResult(jobId: string, result: JobResultDto) {
    const job = await this.biometricJobRepo.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    
    const device = await this.deviceRepo.findOne({ where: { id: job.deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    if (result.success && result.fingerprintId !== undefined) {
      // Check for uniqueness
      const existing = await this.biometricRepo.findOne({
        where: { deviceId: job.deviceId, fingerprintId: result.fingerprintId }
      });

      if (existing) {
        job.status = 'FAILED';
        job.failureReason = 'FINGERPRINT_DUPLICATE';
      } else {
        // Create biometric mapping
        const biometric = this.biometricRepo.create({
          userId: job.userId,
          deviceId: job.deviceId,
          fingerprintId: result.fingerprintId,
          status: 'ACTIVE'
        });
        await this.biometricRepo.save(biometric);

        job.status = 'COMPLETED';
        job.newFingerprintId = result.fingerprintId;
        job.biometricId = biometric.id;
        job.completedAt = new Date();

        if (job.type === 'UPDATE' && job.oldFingerprintId) {
          // Deactivate old fingerprint
          const oldBiometric = await this.biometricRepo.findOne({
            where: { deviceId: job.deviceId, fingerprintId: job.oldFingerprintId }
          });
          if (oldBiometric) {
            oldBiometric.status = 'INACTIVE';
            await this.biometricRepo.save(oldBiometric);
          }
        }
      }
    } else {
      job.status = 'FAILED';
      job.failureReason = result.error || 'DEVICE_ERROR';
    }

    await this.biometricJobRepo.save(job);

    // Reset device back to listening
    device.mode = 'LISTENING';
    device.modeOperationId = '';
    await this.deviceRepo.save(device);

    return job;
  }
}
