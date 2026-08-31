import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities/device.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
  ) {}

  async checkStatus() {
    const devices = await this.deviceRepository.find({
      select: { id: true, name: true, status: true, lastSeen: true }
    });

    const now = new Date();
    
    const deviceStatuses = devices.map(d => {
      // If lastSeen > 5 minutes ago, mark offline
      let isOnline = false;
      if (d.lastSeen) {
        const diff = now.getTime() - d.lastSeen.getTime();
        isOnline = diff < 5 * 60 * 1000;
      }

      return {
        id: d.id,
        name: d.name,
        status: d.status,
        isOnline,
        lastSeen: d.lastSeen
      };
    });

    return {
      status: 'OK',
      timestamp: now,
      devices: deviceStatuses
    };
  }
}
