import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities/device.entity';
import { DeviceRegisterDto, DeviceAuthDto } from './dto/security.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: DeviceRegisterDto) {
    const device = await this.deviceRepository.findOne({ where: { deviceUid: registerDto.deviceUid } });
    
    if (!device) {
      throw new NotFoundException('Device not found. Please add device in admin panel first.');
    }

    if (device.deviceSecretHash !== 'PENDING_REGISTRATION') {
      throw new BadRequestException('Device is already registered. If you need to re-register, reset it from admin panel.');
    }

    // Generate a secure random secret for the device
    const deviceSecret = crypto.randomBytes(32).toString('hex');
    
    // Hash the secret before saving to DB
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(deviceSecret, salt);
    
    device.deviceSecretHash = hash;
    device.status = 'ACTIVE';
    await this.deviceRepository.save(device);

    return {
      deviceId: device.id,
      deviceUid: device.deviceUid,
      deviceSecret: deviceSecret, // Return plain text ONLY ONCE during registration
    };
  }

  async authenticate(authDto: DeviceAuthDto) {
    const device = await this.deviceRepository.findOne({ where: { deviceUid: authDto.deviceUid } });
    
    if (!device) {
      throw new UnauthorizedException('Invalid device credentials');
    }

    if (device.status !== 'ACTIVE') {
      throw new UnauthorizedException('Device is disabled or pending');
    }

    // Verify secret
    const isMatch = await bcrypt.compare(authDto.deviceSecret, device.deviceSecretHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid device credentials');
    }

    // Update last seen
    device.lastSeen = new Date();
    await this.deviceRepository.save(device);

    // Generate JWT token for the device
    const payload = { sub: device.id, deviceUid: device.deviceUid, role: 'DEVICE' };
    
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      if (payload.role !== 'DEVICE') throw new Error();
      
      const newPayload = { sub: payload.sub, deviceUid: payload.deviceUid, role: 'DEVICE' };
      
      return {
        accessToken: this.jwtService.sign(newPayload, { expiresIn: '1d' }),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
