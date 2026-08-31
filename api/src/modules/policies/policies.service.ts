import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AttendancePolicy } from '../../database/entities/policy.entity';

export class CreatePolicyDto {
  name: string;
  openBeforeMinutes?: number;
  lateAfterMinutes?: number;
  closeAfterMinutes?: number;
  allowLate?: boolean;
  autoAbsent?: boolean;
}

export class UpdatePolicyDto {
  name?: string;
  openBeforeMinutes?: number;
  lateAfterMinutes?: number;
  closeAfterMinutes?: number;
  allowLate?: boolean;
  autoAbsent?: boolean;
}

@Injectable()
export class AttendancePoliciesService {
  constructor(
    @InjectRepository(AttendancePolicy) private repo: Repository<AttendancePolicy>,
  ) {}

  async create(dto: CreatePolicyDto) {
    const policy = this.repo.create(dto);
    return this.repo.save(policy);
  }

  findAll() {
    return this.repo.find();
  }

  async findOne(id: string) {
    const policy = await this.repo.findOne({ where: { id } });
    if (!policy) throw new NotFoundException('Policy not found');
    return policy;
  }

  async getDefault() {
    // Returns first policy or creates a default one
    let policy = await this.repo.findOne({ where: {} });
    if (!policy) {
      policy = this.repo.create({
        name: 'Default Policy',
        openBeforeMinutes: 15,
        lateAfterMinutes: 10,
        closeAfterMinutes: 30,
        allowLate: true,
        autoAbsent: true,
      });
      await this.repo.save(policy);
    }
    return policy;
  }

  async update(id: string, dto: UpdatePolicyDto) {
    const policy = await this.findOne(id);
    this.repo.merge(policy, dto);
    return this.repo.save(policy);
  }

  async remove(id: string) {
    const policy = await this.findOne(id);
    return this.repo.remove(policy);
  }
}
