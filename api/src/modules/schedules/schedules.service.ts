import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from '../../database/entities/schedule.entity';

export class CreateScheduleDto {
  courseId: string;
  teacherId?: string;
  sectionId?: string;
  dayOfWeek: string; // Monday, Tuesday, etc.
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  room?: string;
}

export class UpdateScheduleDto {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  room?: string;
  teacherId?: string;
}

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule) private repo: Repository<Schedule>,
  ) {}

  async create(dto: CreateScheduleDto) {
    const schedule = this.repo.create({
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      room: dto.room,
      course: { id: dto.courseId },
      teacher: dto.teacherId ? { id: dto.teacherId } : undefined,
      section: dto.sectionId ? { id: dto.sectionId } : undefined,
    });
    return this.repo.save(schedule);
  }

  findAll() {
    return this.repo.find({ relations: { course: true, teacher: true, section: true } });
  }

  findByCourse(courseId: string) {
    return this.repo.find({
      where: { course: { id: courseId } },
      relations: { course: true, teacher: true, section: true },
    });
  }

  async findOne(id: string) {
    const schedule = await this.repo.findOne({
      where: { id },
      relations: { course: true, teacher: true, section: true },
    });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return schedule;
  }

  async update(id: string, dto: UpdateScheduleDto) {
    const schedule = await this.repo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    if (dto.dayOfWeek) schedule.dayOfWeek = dto.dayOfWeek;
    if (dto.startTime) schedule.startTime = dto.startTime;
    if (dto.endTime) schedule.endTime = dto.endTime;
    if (dto.room) schedule.room = dto.room;
    if (dto.teacherId) schedule.teacher = { id: dto.teacherId } as any;
    return this.repo.save(schedule);
  }

  async remove(id: string) {
    const schedule = await this.repo.findOne({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    return this.repo.remove(schedule);
  }
}
