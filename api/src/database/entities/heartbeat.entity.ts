import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from './device.entity';

@Entity('heartbeats')
export class Heartbeat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @Column({ nullable: true })
  firmwareVersion: string;

  @Column({ nullable: true })
  wifiRssi: number;

  @Column({ nullable: true })
  uptime: number;

  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Device, device => device.heartbeats)
  @JoinColumn({ name: 'deviceId' })
  device: Device;
}
