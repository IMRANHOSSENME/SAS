import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../../database/entities/enrollment.entity';
import { User } from '../../database/entities/user.entity';
import { Course } from '../../database/entities/course.entity';

export class CreateEnrollmentDto {
  userId: string;
  courseId: string;
}

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private repo: Repository<Enrollment>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Course) private courseRepo: Repository<Course>,
  ) {}

  async create(dto: CreateEnrollmentDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException('User not found');

    const course = await this.courseRepo.findOne({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.repo.findOne({
      where: { student: { id: dto.userId }, course: { id: dto.courseId } },
    });
    if (existing) throw new ConflictException('Student is already enrolled in this course');

    const enrollment = this.repo.create({
      student: user,
      course,
      status: 'ENROLLED',
    });
    return this.repo.save(enrollment);
  }

  findAll() {
    return this.repo.find({ relations: { student: true, course: true } });
  }

  findByCourse(courseId: string) {
    return this.repo.find({
      where: { course: { id: courseId } },
      relations: { student: true, course: true },
    });
  }

  findByUser(userId: string) {
    return this.repo.find({
      where: { student: { id: userId } },
      relations: { course: true },
    });
  }

  async findOne(id: string) {
    const enrollment = await this.repo.findOne({
      where: { id },
      relations: { student: true, course: true },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async drop(id: string) {
    const enrollment = await this.findOne(id);
    enrollment.status = 'DROPPED';
    return this.repo.save(enrollment);
  }

  async remove(id: string) {
    const enrollment = await this.findOne(id);
    return this.repo.remove(enrollment);
  }
}
