import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities/device.entity';
import { Heartbeat } from '../../database/entities/heartbeat.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import * as crypto from 'crypto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Heartbeat) private heartbeatRepository: Repository<Heartbeat>,
    @InjectRepository(Biometric) private biometricRepository: Repository<Biometric>,
  ) {}


  async create(createDeviceDto: CreateDeviceDto) {
    const existing = await this.deviceRepository.findOne({ where: { deviceUid: createDeviceDto.deviceUid } });
    if (existing) {
      throw new ConflictException('Device UID already exists');
    }

    // Since this is just registering the device from Admin panel, 
    // the actual device credentials will be generated when the device requests it,
    // or we can pre-generate it here. Let's create a placeholder hash for now.
    const device = this.deviceRepository.create({
      ...createDeviceDto,
      deviceSecretHash: 'PENDING_REGISTRATION', 
    });
    
    return this.deviceRepository.save(device);
  }

  findAll() {
    return this.deviceRepository.find();
  }

  async findOne(id: string) {
    const device = await this.deviceRepository.findOne({ 
      where: { id },
      relations: { events: true } 
    });
    
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    
    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.findOne(id);
    this.deviceRepository.merge(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  async remove(id: string) {
    const device = await this.findOne(id);
    return this.deviceRepository.remove(device);
  }

  async enable(id: string) {
    const device = await this.findOne(id);
    device.status = 'ACTIVE';
    return this.deviceRepository.save(device);
  }

  async disable(id: string) {
    const device = await this.findOne(id);
    device.status = 'DISABLED';
    return this.deviceRepository.save(device);
  }

  async getStatus(id: string) {
    const device = await this.findOne(id);
    return {
      status: device.status,
      mode: device.mode,
      lastSeen: device.lastSeen,
      firmwareVersion: device.firmwareVersion,
    };
  }

  async setMode(id: string, mode: string, operationId?: string) {
    const device = await this.findOne(id);
    device.mode = mode;
    if (operationId) device.modeOperationId = operationId;
    device.modeChangedAt = new Date();
    return this.deviceRepository.save(device);
  }

  async getEvents(id: string) {
    const device = await this.findOne(id);
    return device.events;
  }

  async validateDeviceAuth(uid: string, secret: string): Promise<Device> {
    let device = await this.deviceRepository.findOne({ where: { deviceUid: uid } });
    
    // Auto-registration for new devices
    if (!device) {
      device = this.deviceRepository.create({
        deviceUid: uid,
        name: `SmartBio_${uid.substring(uid.length - 4)}`,
        deviceSecretHash: secret, // MVP: Storing plain secret. Use hashing in production.
        status: 'PENDING',
      });
      await this.deviceRepository.save(device);
      console.log(`[Device Registration] Auto-registered new device: ${uid}`);
    }

    // In a production environment, compare the secret hash properly.
    if (device.deviceSecretHash !== secret) {
      throw new UnauthorizedException('Invalid device credentials');
    }

    // If you want to strictly prevent PENDING devices from sending heartbeats, you could check here.
    // However, allowing heartbeats from PENDING devices lets you see them as "online" before approving.
    if (device.status === 'DISABLED') {
      throw new UnauthorizedException('Device is disabled by administrator');
    }

    return device;
  }

  async processHeartbeat(deviceId: string, payload: any) {
    const device = await this.findOne(deviceId);
    
    device.lastSeen = new Date();
    
    if (device.status !== 'PENDING') {
      device.status = 'ACTIVE';
    }
    if (payload.firmwareVersion) {
      device.firmwareVersion = payload.firmwareVersion;
    }
    
    if (payload.activeSensors && Array.isArray(payload.activeSensors)) {
      device.activeSensors = payload.activeSensors;
    }
    
    await this.deviceRepository.save(device);

    const heartbeat = this.heartbeatRepository.create({
      deviceId: device.id,
      firmwareVersion: payload.firmwareVersion,
      wifiRssi: payload.wifiRssi,
      uptime: payload.uptime,
      ipAddress: payload.ipAddress,
    });
    await this.heartbeatRepository.save(heartbeat);
    return { 
      success: true,
      pendingCommand: {
        type: 'CHANGE_MODE',
        mode: device.mode,
        operationId: device.modeOperationId
      }
    };
  }
}
