import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Biometric } from './biometric.entity';
import { Attendance } from './attendance.entity';
import { Event } from './event.entity';
import { Heartbeat } from './heartbeat.entity';

@Entity('devices')
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  deviceUid: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  location: string;

  @Column()
  deviceSecretHash: string;

  @Column({ nullable: true })
  firmwareVersion: string;

  @Column({ default: 'PENDING' }) // PENDING | ACTIVE | DISABLED | OFFLINE
  status: string;

  @Column('simple-json', { nullable: true })
  activeSensors: string[];

  @Column({ type: 'datetime', nullable: true })
  lastSeen: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Biometric, biometric => biometric.device)
  biometrics: Biometric[];

  @OneToMany(() => Attendance, attendance => attendance.device)
  attendances: Attendance[];

  @OneToMany(() => Event, event => event.device)
  events: Event[];

  @OneToMany(() => Heartbeat, heartbeat => heartbeat.device)
  heartbeats: Heartbeat[];
}
