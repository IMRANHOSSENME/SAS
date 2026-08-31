import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { Teacher } from './teacher.entity';
import { Section } from './section.entity';
import { AttendanceSession } from './attendancesession.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  dayOfWeek: string; // MONDAY, TUESDAY, etc.

  @Column()
  startTime: string; // e.g., '10:00'

  @Column()
  endTime: string; // e.g., '11:00'

  @Column({ nullable: true })
  room: string;

  @ManyToOne(() => Course, course => course.schedules)
  course: Course;

  @ManyToOne(() => Teacher, teacher => teacher.schedules)
  teacher: Teacher;

  @ManyToOne(() => Section, section => section.schedules)
  section: Section;

  @OneToMany(() => AttendanceSession, session => session.schedule)
  sessions: AttendanceSession[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
