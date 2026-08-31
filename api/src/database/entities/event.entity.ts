import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @Column({ nullable: true })
  fingerprintId: number;

  @Column()
  eventType: string; // FINGERPRINT_SCAN | ENROLLMENT | DEVICE_START | DEVICE_ERROR

  @Column()
  result: string; // SUCCESS | FAILED | NOT_FOUND

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Device, device => device.events)
  @JoinColumn({ name: 'deviceId' })
  device: Device;
}
