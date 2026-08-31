import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('policies')
export class AttendancePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 15 })
  openBeforeMinutes: number;

  @Column({ default: 10 })
  lateAfterMinutes: number;

  @Column({ default: 30 })
  closeAfterMinutes: number;

  @Column({ default: true })
  allowLate: boolean;

  @Column({ default: true })
  autoAbsent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
