import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import authConfig from './config/auth.config';

import { Admin } from './database/entities/admin.entity';
import { User } from './database/entities/user.entity';
import { Device } from './database/entities/device.entity';
import { Biometric } from './database/entities/biometric.entity';
import { AttendanceSession } from './database/entities/attendancesession.entity';
import { Attendance } from './database/entities/attendance.entity';
import { Event } from './database/entities/event.entity';
import { Heartbeat } from './database/entities/heartbeat.entity';
import { AuditLog } from './database/entities/auditlog.entity';
import { SystemSetting } from './database/entities/systemsetting.entity';
import { Department } from './database/entities/department.entity';
import { Batch } from './database/entities/batch.entity';
import { Section } from './database/entities/section.entity';
import { Teacher } from './database/entities/teacher.entity';
import { Course } from './database/entities/course.entity';
import { Enrollment } from './database/entities/enrollment.entity';
import { Schedule } from './database/entities/schedule.entity';
import { AttendancePolicy } from './database/entities/policy.entity';
import { BiometricJob } from './database/entities/biometric-job.entity';
import { AttendanceCorrection } from './database/entities/attendance-correction.entity';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SecurityModule } from './modules/security/security.module';
import { HeartbeatsModule } from './modules/heartbeats/heartbeats.module';
import { BiometricsModule } from './modules/biometrics/biometrics.module';
import { EventsModule } from './modules/events/events.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { JwtAuthGuard } from './common/guards/jwtauth.guard';
import { AuditLogInterceptor } from './common/interceptors/auditlog.interceptor';
import { DepartmentsModule } from './modules/departments/departments.module';
import { BatchesModule } from './modules/batches/batches.module';
import { SectionsModule } from './modules/sections/sections.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { AttendancePoliciesModule } from './modules/policies/policies.module';
import { BiometricJobsModule } from './modules/biometric-jobs/biometric-jobs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const type = configService.get<string>('database.type');

        if (type === 'sqlite' || type === 'better-sqlite3') {
          return {
            type: 'better-sqlite3',
            database: configService.get<string>('database.database'),
            entities: [
              Admin, User, Device, Biometric, AttendanceSession, Attendance, Event, Heartbeat, AuditLog, SystemSetting,
              Department, Batch, Section, Teacher, Course, Enrollment, Schedule, AttendancePolicy, BiometricJob, AttendanceCorrection
            ],
            synchronize: true, // DEV ONLY
          } as any;
        }

        return {
          type: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          entities: [
            Admin, User, Device, Biometric, AttendanceSession, Attendance, Event, Heartbeat, AuditLog, SystemSetting,
            Department, Batch, Section, Teacher, Course, Enrollment, Schedule, AttendancePolicy, BiometricJob, AttendanceCorrection
          ],
          synchronize: true, // DEV ONLY
        } as any;
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([AuditLog]),
    AuthModule,
    UsersModule,
    DevicesModule,
    SecurityModule,
    HeartbeatsModule,
    BiometricsModule,
    EventsModule,
    SettingsModule,
    AttendanceModule,
    DashboardModule,
    ReportsModule,
    AuditModule,
    HealthModule,
    DepartmentsModule,
    BatchesModule,
    SectionsModule,
    TeachersModule,
    CoursesModule,
    EnrollmentsModule,
    SchedulesModule,
    AttendancePoliciesModule,
    BiometricJobsModule,
    // Modules will be imported here
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule { }
