import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { Device } from '../../database/entities/device.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
  ) {}

  async getStats() {
    const totalUsers = await this.userRepository.count();
    const totalDevices = await this.deviceRepository.count();
    const activeDevices = await this.deviceRepository.count({ where: { status: 'ACTIVE' } });
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const todayAttendance = await this.attendanceRepository.find({
      where: { attendanceDate: today }
    });

    const presentCount = todayAttendance.length;
    const absentCount = totalUsers - presentCount;

    // Get recent activity (last 5 attendance records)
    const recentLogs = await this.attendanceRepository.find({
      order: { createdAt: 'DESC' },
      take: 5,
      relations: { user: true } // Need to populate user to show their name
    });

    const recentActivity = recentLogs.map(log => ({
      description: `${log.user?.fullName || 'Unknown'} checked in via ${log.method || 'Device'}`,
      timestamp: log.createdAt
    }));

    return {
      success: true,
      data: {
        totalUsers,
        totalDevices,
        activeDevices,
        presentToday: presentCount,
        absentToday: absentCount > 0 ? absentCount : 0,
        recentActivity
      }
    };
  }
}
