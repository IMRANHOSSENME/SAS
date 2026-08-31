import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { BiometricsService } from '../biometrics/biometrics.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private biometricsService: BiometricsService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.userRepository.findOne({ 
      where: [{ studentId: createUserDto.studentId }, { email: createUserDto.email }] 
    });

    if (existing) {
      if (existing.studentId === createUserDto.studentId) {
        throw new ConflictException('Student ID already exists');
      }
      if (createUserDto.email && existing.email === createUserDto.email) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  findAll(search?: string, department?: string) {
    const query = this.userRepository.createQueryBuilder('user');
    
    if (search) {
      query.where('user.fullName ILIKE :search OR user.studentId ILIKE :search', { search: `%${search}%` });
    }
    
    if (department) {
      query.andWhere('user.department = :department', { department });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ 
      where: { id },
      relations: { biometrics: true }
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    
    // First remove all biometrics from sensor and DB
    if (user.biometrics && user.biometrics.length > 0) {
      for (const bio of user.biometrics) {
        await this.biometricsService.remove(bio.id);
      }
    }
    
    // Hard delete the user
    return this.userRepository.remove(user);
  }

  async getBiometrics(id: string) {
    const user = await this.findOne(id);
    return user.biometrics;
  }
}
