import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../database/entities/course.entity';

export class CreateCourseDto {
  code: string;
  name: string;
  description?: string;
  teacherId?: string;
}

export class UpdateCourseDto {
  name?: string;
  description?: string;
  teacherId?: string;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private repo: Repository<Course>,
  ) {}

  async create(dto: CreateCourseDto) {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Course code '${dto.code}' already exists`);
    const course = this.repo.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      teacher: dto.teacherId ? { id: dto.teacherId } : undefined,
    });
    return this.repo.save(course);
  }

  findAll() {
    return this.repo.find({ relations: { teacher: true } });
  }

  async findOne(id: string) {
    const course = await this.repo.findOne({
      where: { id },
      relations: { teacher: true, enrollments: { student: true }, schedules: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, dto: UpdateCourseDto) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (dto.name) course.name = dto.name;
    if (dto.description) course.description = dto.description;
    if (dto.teacherId) course.teacher = { id: dto.teacherId } as any;
    return this.repo.save(course);
  }

  async remove(id: string) {
    const course = await this.repo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return this.repo.remove(course);
  }
}
