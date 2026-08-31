import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../../database/entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventRepository: Repository<Event>,
  ) {}

  async create(data: Partial<Event>) {
    const event = this.eventRepository.create(data);
    return this.eventRepository.save(event);
  }

  findAll() {
    return this.eventRepository.find({
      order: { createdAt: 'DESC' },
      take: 100, // limit to last 100 events
    });
  }

  async findByDevice(deviceId: string) {
    return this.eventRepository.find({
      where: { deviceId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }
}
