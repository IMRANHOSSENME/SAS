import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Batch } from './batch.entity';
import { User } from './user.entity';
import { Schedule } from './schedule.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g., 'CSE 12 A'

  @ManyToOne(() => Batch, batch => batch.sections)
  batch: Batch;

  @OneToMany(() => User, user => user.section)
  students: User[];

  @OneToMany(() => Schedule, schedule => schedule.section)
  schedules: Schedule[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
