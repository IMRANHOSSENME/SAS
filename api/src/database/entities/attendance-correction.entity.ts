import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Attendance } from './attendance.entity';

@Entity('attendance_corrections')
export class AttendanceCorrection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  attendanceId: string;

  @Column()
  changedBy: string;

  @Column()
  oldStatus: string;

  @Column()
  newStatus: string;

  @Column('text')
  reason: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Attendance, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendanceId' })
  attendance: Attendance;
}
