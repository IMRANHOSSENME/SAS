import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from '../../database/entities/attendance.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { Device } from '../../database/entities/device.entity';
import { Event } from '../../database/entities/event.entity';
import { AttendanceSession } from '../../database/entities/attendancesession.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Biometric, Device, Event, AttendanceSession]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
