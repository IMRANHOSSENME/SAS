import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { Device } from '../../database/entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Device])],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
