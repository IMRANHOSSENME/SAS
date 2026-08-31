import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendancePoliciesController } from './policies.controller';
import { AttendancePoliciesService } from './policies.service';
import { AttendancePolicy } from '../../database/entities/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttendancePolicy])],
  controllers: [AttendancePoliciesController],
  providers: [AttendancePoliciesService],
  exports: [AttendancePoliciesService],
})
export class AttendancePoliciesModule {}
