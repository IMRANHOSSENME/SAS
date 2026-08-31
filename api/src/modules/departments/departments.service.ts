import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities/department.entity';

export class CreateDepartmentDto {
  code: string;
  name: string;
  description?: string;
}

export class UpdateDepartmentDto {
  name?: string;
  description?: string;
}

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department) private repo: Repository<Department>,
  ) {}

  async create(dto: CreateDepartmentDto) {
    const existing = await this.repo.findOne({ where: { code: dto.code } });
    if (existing) throw new ConflictException(`Department code '${dto.code}' already exists`);
    const dept = this.repo.create(dto);
    return this.repo.save(dept);
  }

  findAll() {
    return this.repo.find({ relations: { batches: true } });
  }

  async findOne(id: string) {
    const dept = await this.repo.findOne({ where: { id }, relations: { batches: true } });
    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    const dept = await this.findOne(id);
    this.repo.merge(dept, dto);
    return this.repo.save(dept);
  }

  async remove(id: string) {
    const dept = await this.findOne(id);
    return this.repo.remove(dept);
  }
}
