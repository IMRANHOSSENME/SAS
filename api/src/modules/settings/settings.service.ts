import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemSetting } from '../../database/entities/systemsetting.entity';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(SystemSetting) private settingsRepository: Repository<SystemSetting>,
  ) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    const defaults = [
      {
        category: 'attendance',
        config: {
          opensAt: '09:45:00',
          startsAt: '10:00:00',
          lateAfter: '10:10:00',
          closesAt: '10:30:00',
          allowLate: true,
          autoMarkAbsent: true,
          autoCloseSession: true,
          preventDuplicate: true,
          maxAttempts: 3,
          minTimeBetweenScans: 10
        }
      },
      {
        category: 'security',
        config: {
          deviceAuth: true,
          requireHttps: false,
          admin2FA: false,
          sessionTimeout: 30,
          failedLoginLimit: 5
        }
      },
      {
        category: 'data',
        config: {
          attendanceRetentionDays: 365,
          deviceEventsRetentionDays: 90,
          heartbeatRetentionDays: 30,
          auditRetentionDays: 730
        }
      }
    ];

    for (const item of defaults) {
      const existing = await this.settingsRepository.findOne({ where: { category: item.category } });
      if (!existing) {
        const setting = this.settingsRepository.create(item);
        await this.settingsRepository.save(setting);
      }
    }
  }

  async getSettings(category?: string) {
    if (category) {
      return this.settingsRepository.findOne({ where: { category } });
    }
    const all = await this.settingsRepository.find();
    const result: Record<string, any> = {};
    all.forEach(item => {
      result[item.category] = item.config;
    });
    return result;
  }

  async updateSettings(category: string, config: any) {
    let setting = await this.settingsRepository.findOne({ where: { category } });
    if (!setting) {
      setting = this.settingsRepository.create({ category, config });
    } else {
      setting.config = { ...setting.config, ...config };
    }
    return this.settingsRepository.save(setting);
  }
}
