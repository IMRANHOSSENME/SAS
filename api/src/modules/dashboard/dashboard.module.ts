import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../../database/entities/user.entity';
import { Device } from '../../database/entities/device.entity';
import { Attendance } from '../../database/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Device, Attendance])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
