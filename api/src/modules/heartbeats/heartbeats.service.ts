import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Heartbeat } from '../../database/entities/heartbeat.entity';
import { Device } from '../../database/entities/device.entity';
import { CreateHeartbeatDto } from './dto/heartbeat.dto';

@Injectable()
export class HeartbeatsService {
  constructor(
    @InjectRepository(Heartbeat) private heartbeatRepository: Repository<Heartbeat>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
  ) {}

  async create(createHeartbeatDto: CreateHeartbeatDto, ipAddress: string) {
    // Note: deviceId in dto is the UID sent by the ESP8266, not the UUID from DB
    const device = await this.deviceRepository.findOne({ where: { deviceUid: createHeartbeatDto.deviceId } });
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const heartbeat = this.heartbeatRepository.create({
      deviceId: device.id,
      firmwareVersion: createHeartbeatDto.firmwareVersion,
      wifiRssi: createHeartbeatDto.wifiRssi,
      uptime: createHeartbeatDto.uptime,
      ipAddress,
    });

    await this.heartbeatRepository.save(heartbeat);

    // Update device last seen and firmware version
    device.lastSeen = new Date();
    if (createHeartbeatDto.firmwareVersion) {
      device.firmwareVersion = createHeartbeatDto.firmwareVersion;
    }
    await this.deviceRepository.save(device);

    return { success: true };
  }
}
