import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { Biometric } from './biometric.entity';
import { Attendance } from './attendance.entity';
import { Section } from './section.entity';
import { Enrollment } from './enrollment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  studentId: string;

  @Column()
  fullName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  department: string;

  @Column({ nullable: true })
  designation: string;

  @Column({ default: 'ACTIVE' }) // ACTIVE | INACTIVE
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Biometric, biometric => biometric.user)
  biometrics: Biometric[];

  @OneToMany(() => Attendance, attendance => attendance.user)
  attendances: Attendance[];

  @ManyToOne(() => Section, section => section.students, { nullable: true })
  section: Section;

  @OneToMany(() => Enrollment, enrollment => enrollment.student)
  enrollments: Enrollment[];
}
