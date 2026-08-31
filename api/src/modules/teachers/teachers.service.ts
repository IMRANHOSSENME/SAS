import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../../database/entities/teacher.entity';

export class CreateTeacherDto {
  teacherId: string;
  fullName: string;
  email?: string;
  phone?: string;
}

export class UpdateTeacherDto {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher) private repo: Repository<Teacher>,
  ) {}

  async create(dto: CreateTeacherDto) {
    const existing = await this.repo.findOne({ where: { teacherId: dto.teacherId } });
    if (existing) throw new ConflictException(`Teacher ID '${dto.teacherId}' already exists`);
    const teacher = this.repo.create(dto);
    return this.repo.save(teacher);
  }

  findAll() {
    return this.repo.find({ relations: { courses: true } });
  }

  async findOne(id: string) {
    const teacher = await this.repo.findOne({ where: { id }, relations: { courses: true } });
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto) {
    const teacher = await this.findOne(id);
    this.repo.merge(teacher, dto);
    return this.repo.save(teacher);
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);
    return this.repo.remove(teacher);
  }
}
