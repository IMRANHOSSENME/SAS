import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Biometric } from '../../database/entities/biometric.entity';
import { EnrollDto, CompleteEnrollDto } from './dto/biometric.dto';
import { Device } from '../../database/entities/device.entity';
import { User } from '../../database/entities/user.entity';
import { DevicesService } from '../devices/devices.service';

@Injectable()
export class BiometricsService {
  constructor(
    @InjectRepository(Biometric) private biometricRepository: Repository<Biometric>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private devicesService: DevicesService,
  ) {}

  async enroll(enrollDto: EnrollDto) {
    // Look up device via id or uid
    const device = await this.deviceRepository.findOne({ 
      where: [ { id: enrollDto.deviceId }, { deviceUid: enrollDto.deviceId } ] 
    });
    if (!device) throw new NotFoundException('Device not found');

    const user = await this.userRepository.findOne({ where: { id: enrollDto.userId } });
    if (!user) throw new NotFoundException('User not found');

    let biometric = await this.biometricRepository.findOne({ 
      where: { userId: user.id, deviceId: device.id } 
    });

    if (biometric) {
      biometric.deviceId = device.id;
      biometric.fingerprintId = -1; // Placeholder until hardware confirms
      biometric.fingerName = enrollDto.fingerName || biometric.fingerName || 'UNKNOWN';
      biometric.status = 'PENDING';
    } else {
      biometric = this.biometricRepository.create({
        userId: user.id,
        deviceId: device.id,
        fingerprintId: -1,
        fingerName: enrollDto.fingerName || 'UNKNOWN',
        status: 'PENDING',
      });
    }

    return this.biometricRepository.save(biometric);
  }

  async completeEnroll(id: string, completeDto: CompleteEnrollDto) {
    const biometric = await this.biometricRepository.findOne({ where: { id } });
    if (!biometric) throw new NotFoundException('Biometric record not found');

    // Check if this fingerprintId is already registered to someone else on this device
    const existing = await this.biometricRepository.findOne({
      where: {
        deviceId: biometric.deviceId,
        fingerprintId: completeDto.fingerprintId,
        status: 'ACTIVE'
      }
    });

    if (existing && existing.userId !== biometric.userId) {
      // If it exists for another user, reject it
      await this.biometricRepository.remove(biometric); // Clean up the pending record
      throw new ConflictException('This fingerprint is already registered to another user.');
    }

    biometric.fingerprintId = completeDto.fingerprintId;
    biometric.status = 'ACTIVE';
    return this.biometricRepository.save(biometric);
  }

  findAll() {
    return this.biometricRepository.find({ relations: { user: true, device: true } });
  }

  async findOne(id: string) {
    const biometric = await this.biometricRepository.findOne({ 
      where: { id },
      relations: { user: true, device: true }
    });
    if (!biometric) throw new NotFoundException('Biometric not found');
    return biometric;
  }

  async remove(id: string) {
    const biometric = await this.findOne(id);
    if (biometric.fingerprintId !== -1) {
      await this.devicesService.setDeleteTask(biometric.device.id, biometric.fingerprintId);
    }
    return this.biometricRepository.remove(biometric);
  }

  async getOrphans(deviceId: string) {
    const sensorIds = this.devicesService.getSensorFingerprints(deviceId);
    if (!sensorIds || sensorIds.length === 0) {
      return { total: 0, sensorIds: [], orphans: [] };
    }

    const dbBiometrics = await this.biometricRepository.find({
      where: { deviceId, status: 'ACTIVE' },
      select: { fingerprintId: true }
    });

    const dbIds = dbBiometrics.map(b => b.fingerprintId);
    
    const orphans = sensorIds.filter(id => !dbIds.includes(id));
    
    return {
      total: sensorIds.length,
      sensorIds: sensorIds,
      registered: dbIds.length,
      orphans: orphans
    };
  }

  async removeOrphan(deviceId: string, fingerprintId: number) {
    // Only queue a delete task, there is no DB record to delete
    await this.devicesService.setDeleteTask(deviceId, fingerprintId);
    
    // Optimistically remove from in-memory sensor list so UI updates
    const sensorIds = this.devicesService.getSensorFingerprints(deviceId);
    const updated = sensorIds.filter(id => id != fingerprintId); // note: filter out the id
    await this.devicesService.processSyncData(deviceId, updated);
    
    return { success: true, message: `Queued delete task for orphan ID ${fingerprintId}` };
  }
}
