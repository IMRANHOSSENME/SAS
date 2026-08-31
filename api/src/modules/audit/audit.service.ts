import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/auditlog.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditLogRepository: Repository<AuditLog>,
  ) {}

  findAll() {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
      take: 100, // limit to 100 recent
      relations: { admin: true }
    });
  }
}
