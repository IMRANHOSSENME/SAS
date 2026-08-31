import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from '../../database/entities/batch.entity';

export class CreateBatchDto {
  name: string;
  departmentId: string;
  year?: number;
}

export class UpdateBatchDto {
  name?: string;
  year?: number;
}

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch) private repo: Repository<Batch>,
  ) {}

  async create(dto: CreateBatchDto) {
    const batch = this.repo.create({
      name: dto.name,
      year: dto.year,
      department: { id: dto.departmentId },
    });
    return this.repo.save(batch);
  }

  findAll() {
    return this.repo.find({ relations: { department: true, sections: true } });
  }

  async findOne(id: string) {
    const batch = await this.repo.findOne({ where: { id }, relations: { department: true, sections: true } });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async update(id: string, dto: UpdateBatchDto) {
    const batch = await this.findOne(id);
    this.repo.merge(batch, dto);
    return this.repo.save(batch);
  }

  async remove(id: string) {
    const batch = await this.findOne(id);
    return this.repo.remove(batch);
  }
}
