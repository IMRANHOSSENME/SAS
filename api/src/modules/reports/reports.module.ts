import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Attendance } from '../../database/entities/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
