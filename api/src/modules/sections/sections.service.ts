import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from '../../database/entities/section.entity';

export class CreateSectionDto {
  name: string;
  batchId: string;
}

export class UpdateSectionDto {
  name?: string;
}

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section) private repo: Repository<Section>,
  ) {}

  async create(dto: CreateSectionDto) {
    const section = this.repo.create({
      name: dto.name,
      batch: { id: dto.batchId },
    });
    return this.repo.save(section);
  }

  findAll() {
    return this.repo.find({ relations: { batch: true } });
  }

  async findOne(id: string) {
    const section = await this.repo.findOne({ where: { id }, relations: { batch: true } });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(id: string, dto: UpdateSectionDto) {
    const section = await this.findOne(id);
    this.repo.merge(section, dto);
    return this.repo.save(section);
  }

  async remove(id: string) {
    const section = await this.findOne(id);
    return this.repo.remove(section);
  }
}
