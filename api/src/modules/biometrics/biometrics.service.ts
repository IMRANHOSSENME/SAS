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
    // Ideally we should queue a delete job to the device via BiometricJobsModule
    return this.biometricRepository.remove(biometric);
  }
}
