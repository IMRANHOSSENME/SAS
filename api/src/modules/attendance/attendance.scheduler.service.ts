import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Schedule } from '../../database/entities/schedule.entity';
import { AttendanceSession } from '../../database/entities/attendancesession.entity';
import { AttendancePolicy } from '../../database/entities/policy.entity';
import { Attendance } from '../../database/entities/attendance.entity';
import { Enrollment } from '../../database/entities/enrollment.entity';

@Injectable()
export class AttendanceSchedulerService {
  private readonly logger = new Logger(AttendanceSchedulerService.name);

  constructor(
    @InjectRepository(Schedule)
    private scheduleRepo: Repository<Schedule>,
    @InjectRepository(AttendanceSession)
    private sessionRepo: Repository<AttendanceSession>,
    @InjectRepository(AttendancePolicy)
    private policyRepo: Repository<AttendancePolicy>,
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('Running automated attendance scheduler...');
    const now = new Date();
    
    // Day of week mapping: 0 = Sun, 1 = Mon, ...
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = days[now.getDay()];
    
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Fetch schedules for today
    const schedules = await this.scheduleRepo.find({
      where: { dayOfWeek: currentDay },
      relations: { course: true }
    });

    for (const schedule of schedules) {
      // Find if a session exists for this schedule today
      let session = await this.sessionRepo.findOne({
        where: { schedule: { id: schedule.id }, sessionDate: todayStr }
      });

      if (!session) {
        // Create session
        // Assuming time format is HH:MM:SS or HH:MM
        const [hours, minutes] = schedule.startTime.split(':').map(Number);
        
        const startsAt = new Date(now);
        startsAt.setHours(hours, minutes, 0, 0);

        // Fetch policy, defaulting if none exists
        const policy = await this.policyRepo.findOne({ where: {} }); // Assuming default policy for now
        
        const openBeforeMins = policy?.openBeforeMinutes || 15;
        const lateAfterMins = policy?.lateAfterMinutes || 10;
        const closeAfterMins = policy?.closeAfterMinutes || 30;

        const opensAt = new Date(startsAt);
        opensAt.setMinutes(opensAt.getMinutes() - openBeforeMins);

        const lateAt = new Date(startsAt);
        lateAt.setMinutes(lateAt.getMinutes() + lateAfterMins);

        const closesAt = new Date(startsAt);
        closesAt.setMinutes(closesAt.getMinutes() + closeAfterMins);

        session = this.sessionRepo.create({
          name: `${schedule.course?.name || 'Class'} Session`,
          sessionDate: todayStr,
          opensAt,
          startsAt,
          lateAt,
          closesAt,
          status: 'SCHEDULED',
          schedule: schedule,
          policy: policy || undefined
        });

        await this.sessionRepo.save(session);
        this.logger.log(`Created session ${session.id} for schedule ${schedule.id}`);
      }

      // State transitions
      if (session.status === 'SCHEDULED' && now >= session.opensAt) {
        session.status = 'OPEN';
        await this.sessionRepo.save(session);
        this.logger.log(`Session ${session.id} is now OPEN`);
      }
      else if (session.status === 'OPEN' && now >= session.closesAt) {
        session.status = 'CLOSED';
        await this.sessionRepo.save(session);
        this.logger.log(`Session ${session.id} is now CLOSED`);

        // Post-close action: Mark ABSENT
        await this.markAbsentees(session, schedule.course.id);
      }
    }
  }

  private async markAbsentees(session: AttendanceSession, courseId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { course: { id: courseId }, status: 'ENROLLED' },
      relations: { student: true }
    });

    for (const enrollment of enrollments) {
      const record = await this.attendanceRepo.findOne({
        where: { session: { id: session.id }, user: { id: enrollment.student.id } }
      });

      if (!record) {
        const absent = this.attendanceRepo.create({
          userId: enrollment.student.id,
          deviceId: 'SYSTEM',
          sessionId: session.id,
          attendanceDate: session.sessionDate,
          status: 'ABSENT',
          method: 'AUTO'
        });
        await this.attendanceRepo.save(absent);
        this.logger.log(`Marked student ${enrollment.student.id} ABSENT for session ${session.id}`);
      }
    }
  }
}
