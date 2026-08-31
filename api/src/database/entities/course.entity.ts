import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Enrollment } from './enrollment.entity';
import { Schedule } from './schedule.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string; // e.g. CSE-101

  @Column()
  name: string; // e.g. Database Management

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Teacher, teacher => teacher.courses)
  teacher: Teacher;

  @OneToMany(() => Enrollment, enrollment => enrollment.course)
  enrollments: Enrollment[];

  @OneToMany(() => Schedule, schedule => schedule.course)
  schedules: Schedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
