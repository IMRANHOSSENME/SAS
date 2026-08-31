import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Device } from './device.entity';
import { Biometric } from './biometric.entity';

@Entity('biometric_jobs')
export class BiometricJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column()
  type: string; // ENROLL | UPDATE

  @Column({ default: 'PENDING' })
  status: string; // PENDING | DEVICE_READY | SCANNING | VERIFYING | ENROLLING | SYNCING | COMPLETED | FAILED | CANCELLED

  @Column({ nullable: true })
  oldFingerprintId: number;

  @Column({ nullable: true })
  newFingerprintId: number;

  @Column({ nullable: true })
  biometricId: string;

  @Column({ nullable: true })
  requestedBy: string;

  @Column({ type: 'datetime', nullable: true })
  requestedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date;

  @Column({ nullable: true })
  failureReason: string;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'deviceId' })
  device: Device;

  @ManyToOne(() => Biometric, { nullable: true })
  @JoinColumn({ name: 'biometricId' })
  biometric: Biometric;
}
