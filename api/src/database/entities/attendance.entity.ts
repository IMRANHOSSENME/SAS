import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Device } from './device.entity';
import { AttendanceSession } from './attendancesession.entity';

@Entity('attendance')
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ type: 'date' })
  attendanceDate: string;

  @Column({ type: 'time', nullable: true })
  checkIn: string;

  @Column({ type: 'time', nullable: true })
  checkOut: string;

  @Column()
  status: string; // PRESENT | LATE | ABSENT

  @Column({ default: 'FINGERPRINT' })
  method: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.attendances, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Device, device => device.attendances)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @ManyToOne(() => AttendanceSession, session => session.attendances, { nullable: true })
  @JoinColumn({ name: 'sessionId' })
  session: AttendanceSession;
}
