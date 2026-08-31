import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../database/entities/attendance.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { Device } from '../../database/entities/device.entity';
import { Event } from '../../database/entities/event.entity';
import { AttendanceSession } from '../../database/entities/attendancesession.entity';
import { ScanDto } from './dto/attendance.dto';
import { format } from 'date-fns';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Biometric) private biometricRepository: Repository<Biometric>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    @InjectRepository(AttendanceSession) private sessionRepository: Repository<AttendanceSession>,
  ) {}

  async processScan(scanDto: ScanDto) {
    const device = await this.deviceRepository.findOne({ where: { deviceUid: scanDto.deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    const biometric = await this.biometricRepository.findOne({ 
      where: { deviceId: device.id, fingerprintId: scanDto.fingerprintId, status: 'ACTIVE' },
      relations: { user: true } 
    });

    // Log the event
    await this.eventRepository.save({
      deviceId: device.id,
      fingerprintId: scanDto.fingerprintId,
      eventType: 'FINGERPRINT_SCAN',
      result: biometric ? 'SUCCESS' : 'NOT_FOUND',
      metadata: { eventId: scanDto.eventId }
    });

    if (!biometric) {
      return { success: false, result: 'NOT_FOUND' };
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const currentTime = format(new Date(), 'HH:mm:ss');

    // Check for duplicate scan today
    let attendance = await this.attendanceRepository.findOne({
      where: { userId: biometric.user.id, attendanceDate: today }
    });

    if (attendance) {
      // If already checked in, maybe mark check-out
      if (!attendance.checkOut) {
        // Prevent accidental double scan within 5 minutes (300000 ms)
        const checkInTime = new Date(`${today}T${attendance.checkIn}`);
        const now = new Date();
        if (now.getTime() - checkInTime.getTime() > 300000) {
          attendance.checkOut = currentTime;
          await this.attendanceRepository.save(attendance);
          return { success: true, result: 'CHECK_OUT', user: biometric.user, attendance };
        }
        return { success: false, result: 'DUPLICATE_SCAN' };
      }
      return { success: false, result: 'ALREADY_COMPLETED' };
    }

    // Get active session for today
    const activeSession = await this.sessionRepository.findOne({
      where: { status: 'ACTIVE' },
      order: { createdAt: 'DESC' }
    });

    let status = 'PRESENT';
    let sessionId: string | undefined = undefined;

    if (activeSession && activeSession.startTime) {
      sessionId = activeSession.id;
      // Calculate late status
      const [startHours, startMinutes] = activeSession.startTime.split(':').map(Number);
      const graceMinutes = activeSession.lateGraceMinutes || 15;
      
      const sessionStartMin = startHours * 60 + startMinutes;
      const currentMin = new Date().getHours() * 60 + new Date().getMinutes();
      
      if (currentMin > (sessionStartMin + graceMinutes)) {
        status = 'LATE';
      }
    }

    attendance = this.attendanceRepository.create({
      userId: biometric.user.id,
      deviceId: device.id,
      sessionId: sessionId,
      attendanceDate: today,
      checkIn: currentTime,
      status: status,
      method: 'FINGERPRINT'
    });

    await this.attendanceRepository.save(attendance);

    return { 
      success: true, 
      result: 'CHECK_IN', 
      user: { id: biometric.user.id, name: biometric.user.fullName }, 
      attendance 
    };
  }

  findAll(filters?: { date?: string, userId?: string, deviceId?: string }) {
    const query = this.attendanceRepository.createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.user', 'user')
      .leftJoinAndSelect('attendance.device', 'device');

    if (filters?.date) {
      query.andWhere('attendance.attendanceDate = :date', { date: filters.date });
    }
    if (filters?.userId) {
      query.andWhere('attendance.userId = :userId', { userId: filters.userId });
    }
    if (filters?.deviceId) {
      query.andWhere('attendance.deviceId = :deviceId', { deviceId: filters.deviceId });
    }

    return query.getMany();
  }

  async findOne(id: string) {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: { user: true, device: true }
    });
    if (!attendance) throw new NotFoundException('Attendance record not found');
    return attendance;
  }

  async getActiveSession() {
    return this.sessionRepository.findOne({
      where: { status: 'ACTIVE' },
      order: { createdAt: 'DESC' }
    });
  }

  async createOrUpdateSession(sessionData: any) {
    let session = await this.getActiveSession();
    if (!session) {
      session = this.sessionRepository.create({
        name: sessionData.name || 'Default Session',
        startTime: sessionData.startTime || '09:00',
        endTime: sessionData.endTime || '17:00',
        lateGraceMinutes: sessionData.lateGraceMinutes || 15,
        status: 'ACTIVE'
      });
    } else {
      if (sessionData.name) session.name = sessionData.name;
      if (sessionData.startTime) session.startTime = sessionData.startTime;
      if (sessionData.endTime) session.endTime = sessionData.endTime;
      if (sessionData.lateGraceMinutes !== undefined) session.lateGraceMinutes = sessionData.lateGraceMinutes;
    }
    return this.sessionRepository.save(session);
  }

  async getLiveFeed(date: string) {
    return this.attendanceRepository.find({
      where: { attendanceDate: date },
      relations: { user: true, device: true },
      order: { updatedAt: 'DESC' },
      take: 50
    });
  }

  async getSummary(date: string) {
    const attendances = await this.attendanceRepository.find({
      where: { attendanceDate: date }
    });

    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const late = attendances.filter(a => a.status === 'LATE').length;
    return { present, late, totalScans: attendances.length };
  }
}

