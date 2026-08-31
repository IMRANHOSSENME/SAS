import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SecurityService } from './security.service';
import { SecurityController } from './security.controller';
import { Device } from '../../database/entities/device.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('auth.jwtSecret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SecurityController],
  providers: [SecurityService],
})
export class SecurityModule {}
