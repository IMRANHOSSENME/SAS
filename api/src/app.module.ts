import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
              Admin, User, Device, Biometric, AttendanceSession, Attendance, Event, Heartbeat, AuditLog, SystemSetting
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
            Admin, User, Device, Biometric, AttendanceSession, Attendance, Event, Heartbeat, AuditLog, SystemSetting
          ],
          synchronize: true, // DEV ONLY
        } as any;
      },
      inject: [ConfigService],
    }),
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
export class AppModule {}
