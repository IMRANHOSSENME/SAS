import { Module } from '@nestjs/common';
import { BiometricJobsController } from './biometric-jobs.controller';
import { BiometricJobsService } from './biometric-jobs.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiometricJob } from '../../database/entities/biometric-job.entity';
import { Device } from '../../database/entities/device.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BiometricJob, Device, Biometric, User])],
  controllers: [BiometricJobsController],
  providers: [BiometricJobsService]
})
export class BiometricJobsModule {}
