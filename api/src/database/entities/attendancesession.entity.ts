import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Attendance } from './attendance.entity';
import { Schedule } from './schedule.entity';
import { AttendancePolicy } from './policy.entity';

@Entity('attendancesessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date', nullable: true })
  sessionDate: string;

  @Column({ type: 'datetime', nullable: true })
  opensAt: Date;

  @Column({ type: 'datetime', nullable: true })
  startsAt: Date;

  @Column({ type: 'datetime', nullable: true })
  lateAt: Date;

  @Column({ type: 'datetime', nullable: true })
  closesAt: Date;

  @Column({ nullable: true })
  policyId: string;

  @Column({ default: 'SCHEDULED' }) // SCHEDULED | OPEN | CLOSED
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Attendance, attendance => attendance.session)
  attendances: Attendance[];

  @ManyToOne(() => Schedule, schedule => schedule.sessions, { nullable: true })
  schedule: Schedule;

  @ManyToOne(() => AttendancePolicy, { nullable: true })
  @JoinColumn({ name: 'policyId' })
  policy: AttendancePolicy;
}
