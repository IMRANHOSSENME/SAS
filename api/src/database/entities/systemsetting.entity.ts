import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_settings')
export class SystemSetting {
  @PrimaryColumn()
  category: string;

  @Column({ type: 'simple-json' })
  config: any;

  @UpdateDateColumn()
  updatedAt: Date;
}
