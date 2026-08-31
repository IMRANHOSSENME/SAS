import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeartbeatsService } from './heartbeats.service';
import { Heartbeat } from '../../database/entities/heartbeat.entity';
import { Device } from '../../database/entities/device.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Heartbeat, Device])],
  controllers: [],
  providers: [HeartbeatsService],
})
export class HeartbeatsModule {}
