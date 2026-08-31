import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../database/entities/attendance.entity';
import { Between } from 'typeorm';
import { startOfMonth, endOfMonth, format } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
  ) {}

  async getDailyReport(date: string) {
    return this.attendanceRepository.find({
      where: { attendanceDate: date },
      relations: { user: true, device: true }
    });
  }

  async getMonthlyReport(year: number, month: number) {
    const startDate = format(new Date(year, month - 1, 1), 'yyyy-MM-dd');
    const endDate = format(new Date(year, month, 0), 'yyyy-MM-dd');

    const records = await this.attendanceRepository.find({
      where: { attendanceDate: Between(startDate, endDate) },
      relations: { user: true }
    });

    // Group by user
    const userStats: Record<string, any> = {};
    records.forEach(record => {
      if (!userStats[record.user.id]) {
        userStats[record.user.id] = {
          user: { id: record.user.id, name: record.user.fullName, studentId: record.user.studentId },
          present: 0,
          late: 0,
          absent: 0 // calculate based on working days if needed
        };
      }
      if (record.status === 'LATE') userStats[record.user.id].late++;
      else if (record.status === 'PRESENT') userStats[record.user.id].present++;
    });

    return Object.values(userStats);
  }
}
