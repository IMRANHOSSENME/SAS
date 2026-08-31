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
import { AttendanceCorrection } from '../../database/entities/attendance-correction.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance) private attendanceRepository: Repository<Attendance>,
    @InjectRepository(Biometric) private biometricRepository: Repository<Biometric>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Event) private eventRepository: Repository<Event>,
    @InjectRepository(AttendanceSession) private sessionRepository: Repository<AttendanceSession>,
    @InjectRepository(AttendanceCorrection) private correctionRepo: Repository<AttendanceCorrection>,
  ) {}

  async processScan(scanDto: ScanDto) {
    const device = await this.deviceRepository.findOne({ where: { deviceUid: scanDto.deviceId } });
    if (!device) return { success: false, status: 'UNKNOWN_DEVICE' };

    // 1. Lookup Biometric
    const biometric = await this.biometricRepository.findOne({ 
      where: { deviceId: device.id, fingerprintId: scanDto.fingerprintId, status: 'ACTIVE' },
      relations: { user: { enrollments: { course: true } } } 
    });

    if (!biometric) {
      return { success: false, status: 'UNKNOWN_FINGER' };
    }

    // 2. Check device mode
    if (device.mode !== 'LISTENING') {
      return { success: false, status: 'DEVICE_NOT_IN_LISTENING_MODE' };
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const scannedAt = new Date();

    // 3. Find open session for user's courses
    const userCourseIds = biometric.user.enrollments?.map(e => e.course?.id).filter(id => id) || [];
    
    // We need to query sessions for these courses
    const sessions = await this.sessionRepository.createQueryBuilder('session')
      .leftJoinAndSelect('session.schedule', 'schedule')
      .leftJoinAndSelect('schedule.course', 'course')
      .where('session.sessionDate = :today', { today })
      .andWhere('session.status = :status', { status: 'OPEN' })
      .getMany();

    const activeSession = sessions.find(s => s.schedule?.course && userCourseIds.includes(s.schedule.course.id));

    if (!activeSession) {
      return { success: false, status: 'NO_ACTIVE_SESSION' };
    }

    // 4. Check double mark
    const existingAttendance = await this.attendanceRepository.findOne({
      where: { sessionId: activeSession.id, userId: biometric.user.id }
    });

    if (existingAttendance) {
      return { 
        success: false, 
        status: 'ALREADY_MARKED',
        student: { name: biometric.user.fullName } 
      };
    }

    // 5. Time resolution
    let finalStatus = 'PRESENT';
    if (scannedAt < activeSession.opensAt) {
      finalStatus = 'TOO_EARLY';
    } else if (scannedAt >= activeSession.closesAt) {
      finalStatus = 'CLOSED';
    } else if (scannedAt >= activeSession.lateAt) {
      finalStatus = 'LATE';
    }

    if (finalStatus === 'TOO_EARLY' || finalStatus === 'CLOSED') {
      return { success: false, status: finalStatus };
    }

    // 6. Create Record
    const attendance = this.attendanceRepository.create({
      userId: biometric.user.id,
      deviceId: device.id,
      sessionId: activeSession.id,
      biometricId: biometric.id,
      attendanceDate: today,
      checkIn: format(scannedAt, 'HH:mm:ss'),
      status: finalStatus,
      method: 'FINGERPRINT'
    });

    await this.attendanceRepository.save(attendance);

    return { 
      success: true, 
      status: finalStatus,
      student: { name: biometric.user.fullName },
      course: { name: activeSession.schedule?.course?.name },
      markedAt: format(scannedAt, 'HH:mm')
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

  async getSessions() {
    return this.sessionRepository.find({ order: { sessionDate: 'DESC', createdAt: 'DESC' } });
  }

  async updateSessionStatus(id: string, status: string) {
    const session = await this.sessionRepository.findOne({ where: { id } });
    if (!session) throw new NotFoundException('Session not found');
    session.status = status;
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

  async correctAttendance(id: string, newStatus: string, reason: string, adminId: string) {
    const attendance = await this.attendanceRepository.findOne({ where: { id } });
    if (!attendance) throw new NotFoundException('Attendance not found');

    const oldStatus = attendance.status;
    attendance.status = newStatus;
    attendance.method = 'MANUAL_OVERRIDE';
    await this.attendanceRepository.save(attendance);

    const correction = this.correctionRepo.create({
      attendanceId: id,
      oldStatus,
      newStatus,
      reason,
      changedBy: adminId
    });
    await this.correctionRepo.save(correction);

    return attendance;
  }

  async getCorrections(attendanceId: string) {
    return this.correctionRepo.find({
      where: { attendanceId },
      order: { createdAt: 'DESC' }
    });
  }
}

