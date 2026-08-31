import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricsService } from './biometrics.service';
import { BiometricsController } from './biometrics.controller';
import { Biometric } from '../../database/entities/biometric.entity';
import { Device } from '../../database/entities/device.entity';
import { User } from '../../database/entities/user.entity';
import { DevicesModule } from '../devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Biometric, Device, User]),
    DevicesModule
  ],
  controllers: [BiometricsController],
  providers: [BiometricsService],
  exports: [BiometricsService],
})
export class BiometricsModule {}
