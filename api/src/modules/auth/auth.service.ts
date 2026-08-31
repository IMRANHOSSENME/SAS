import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from '../../database/entities/admin.entity';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingAdmin = await this.adminRepository.findOne({ where: { email: registerDto.email } });
    if (existingAdmin) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(registerDto.password, salt);

    const admin = this.adminRepository.create({
      fullName: registerDto.fullName,
      email: registerDto.email,
      passwordHash,
    });

    await this.adminRepository.save(admin);
    const { passwordHash: _, ...result } = admin;
    return result;
  }

  async login(loginDto: LoginDto) {
    const admin = await this.adminRepository.findOne({ where: { email: loginDto.email } });
    
    if (!admin || !(await bcrypt.compare(loginDto.password, admin.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account is not active');
    }

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
        expiresIn: this.configService.get<string>('auth.jwtRefreshExpiresIn') as any,
      }),
      admin: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      }
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
      });

      const newPayload = { sub: payload.sub, email: payload.email, role: payload.role };
      
      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
