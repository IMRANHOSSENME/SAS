import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { Attendance } from '../../database/entities/attendance.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { Device } from '../../database/entities/device.entity';
import { Event } from '../../database/entities/event.entity';
import { AttendanceSession } from '../../database/entities/attendancesession.entity';
import { AttendanceSchedulerService } from './attendance.scheduler.service';
import { Schedule } from '../../database/entities/schedule.entity';
import { AttendancePolicy } from '../../database/entities/policy.entity';
import { Enrollment } from '../../database/entities/enrollment.entity';
import { AttendanceCorrection } from '../../database/entities/attendance-correction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance, Biometric, Device, Event, AttendanceSession,
      Schedule, AttendancePolicy, Enrollment, AttendanceCorrection
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceSchedulerService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
