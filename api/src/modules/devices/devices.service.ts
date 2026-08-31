import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities/device.entity';
import { Heartbeat } from '../../database/entities/heartbeat.entity';
import { Biometric } from '../../database/entities/biometric.entity';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import * as crypto from 'crypto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    @InjectRepository(Heartbeat) private heartbeatRepository: Repository<Heartbeat>,
    @InjectRepository(Biometric) private biometricRepository: Repository<Biometric>,
  ) {}

  // In-memory store for pending tasks per device
  private pendingDeviceTasks = new Map<string, any[]>();

  // In-memory store for live enrollment status per device
  // status: 'IDLE' | 'WAITING_FINGER_1' | 'FINGER_1_OK' | 'WAITING_FINGER_2' | 'PROCESSING' | 'SUCCESS' | 'FAILED'
  private enrollmentStatusMap = new Map<string, { status: string; message: string; updatedAt: Date }>();

  // In-memory store for last synced sensor fingerprint IDs
  private deviceSensorIdsMap = new Map<string, number[]>();

  updateEnrollmentStatus(deviceId: string, status: string, message: string) {
    this.enrollmentStatusMap.set(deviceId, { status, message, updatedAt: new Date() });
    console.log(`[EnrollStatus] Device ${deviceId}: ${status} — ${message}`);
  }

  getEnrollmentStatus(deviceId: string) {
    return this.enrollmentStatusMap.get(deviceId) ?? { status: 'IDLE', message: '', updatedAt: new Date() };
  }

  async setEnrollmentTask(deviceId: string, userId: string, type: string) {
    const tasks = this.pendingDeviceTasks.get(deviceId) || [];
    tasks.push({ action: 'ENROLL', userId, sensorType: type });
    this.pendingDeviceTasks.set(deviceId, tasks);
    return { message: 'Enrollment task queued' };
  }

  async setDeleteTask(deviceId: string, fingerprintId: number) {
    const tasks = this.pendingDeviceTasks.get(deviceId) || [];
    tasks.push({ action: 'DELETE', fingerprintId });
    this.pendingDeviceTasks.set(deviceId, tasks);
    return { message: 'Delete task queued' };
  }

  async setSyncTask(deviceId: string) {
    const tasks = this.pendingDeviceTasks.get(deviceId) || [];
    tasks.push({ action: 'SYNC' });
    this.pendingDeviceTasks.set(deviceId, tasks);
    return { message: 'Sync task queued' };
  }

  async create(createDeviceDto: CreateDeviceDto) {
    const existing = await this.deviceRepository.findOne({ where: { deviceUid: createDeviceDto.deviceUid } });
    if (existing) {
      throw new ConflictException('Device UID already exists');
    }

    // Since this is just registering the device from Admin panel, 
    // the actual device credentials will be generated when the device requests it,
    // or we can pre-generate it here. Let's create a placeholder hash for now.
    const device = this.deviceRepository.create({
      ...createDeviceDto,
      deviceSecretHash: 'PENDING_REGISTRATION', 
    });
    
    return this.deviceRepository.save(device);
  }

  findAll() {
    return this.deviceRepository.find();
  }

  async findOne(id: string) {
    const device = await this.deviceRepository.findOne({ 
      where: { id },
      relations: { events: true } 
    });
    
    if (!device) {
      throw new NotFoundException(`Device with ID ${id} not found`);
    }
    
    return device;
  }

  async update(id: string, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.findOne(id);
    this.deviceRepository.merge(device, updateDeviceDto);
    return this.deviceRepository.save(device);
  }

  async remove(id: string) {
    const device = await this.findOne(id);
    return this.deviceRepository.remove(device);
  }

  async enable(id: string) {
    const device = await this.findOne(id);
    device.status = 'ACTIVE';
    return this.deviceRepository.save(device);
  }

  async disable(id: string) {
    const device = await this.findOne(id);
    device.status = 'DISABLED';
    return this.deviceRepository.save(device);
  }

  async getStatus(id: string) {
    const device = await this.findOne(id);
    return {
      status: device.status,
      lastSeen: device.lastSeen,
      firmwareVersion: device.firmwareVersion,
    };
  }

  async getEvents(id: string) {
    const device = await this.findOne(id);
    return device.events;
  }

  async validateDeviceAuth(uid: string, secret: string): Promise<Device> {
    let device = await this.deviceRepository.findOne({ where: { deviceUid: uid } });
    
    // Auto-registration for new devices
    if (!device) {
      device = this.deviceRepository.create({
        deviceUid: uid,
        name: `SmartBio_${uid.substring(uid.length - 4)}`,
        deviceSecretHash: secret, // MVP: Storing plain secret. Use hashing in production.
        status: 'PENDING',
      });
      await this.deviceRepository.save(device);
      console.log(`[Device Registration] Auto-registered new device: ${uid}`);
    }

    // In a production environment, compare the secret hash properly.
    if (device.deviceSecretHash !== secret) {
      throw new UnauthorizedException('Invalid device credentials');
    }

    // If you want to strictly prevent PENDING devices from sending heartbeats, you could check here.
    // However, allowing heartbeats from PENDING devices lets you see them as "online" before approving.
    if (device.status === 'DISABLED') {
      throw new UnauthorizedException('Device is disabled by administrator');
    }

    return device;
  }

  async processHeartbeat(deviceId: string, payload: any) {
    const device = await this.findOne(deviceId);
    
    device.lastSeen = new Date();
    
    if (device.status !== 'PENDING') {
      device.status = 'ACTIVE';
    }
    if (payload.firmwareVersion) {
      device.firmwareVersion = payload.firmwareVersion;
    }
    
    if (payload.activeSensors && Array.isArray(payload.activeSensors)) {
      device.activeSensors = payload.activeSensors;
    }
    
    await this.deviceRepository.save(device);

    const heartbeat = this.heartbeatRepository.create({
      deviceId: device.id,
      firmwareVersion: payload.firmwareVersion,
      wifiRssi: payload.wifiRssi,
      uptime: payload.uptime,
      ipAddress: payload.ipAddress,
    });
    await this.heartbeatRepository.save(heartbeat);

    // Handle live enrollment status updates from device
    // Device sends: { enrollmentStatus: { status: 'WAITING_FINGER_1', message: 'Place Finger...' } }
    if (payload.enrollmentStatus) {
      this.updateEnrollmentStatus(device.id, payload.enrollmentStatus.status, payload.enrollmentStatus.message);
    }

    // Handle enrollment result sent by device after scanning finger
    if (payload.enrollmentResult) {
      const result = payload.enrollmentResult;
      console.log(`[Enrollment Result] Device ${device.deviceUid} sent result:`, result);
      await this.processEnrollmentResult(device.id, result.userId, result.fingerprintId, result.sensorType);
      this.updateEnrollmentStatus(device.id, 'SUCCESS', 'Fingerprint enrolled!');
    }

    // Check if there are pending tasks for this device
    const tasks = this.pendingDeviceTasks.get(device.id);
    if (tasks && tasks.length > 0) {
      // Pop the oldest task
      const nextTask = tasks.shift();
      if (tasks.length === 0) {
        this.pendingDeviceTasks.delete(device.id);
      } else {
        this.pendingDeviceTasks.set(device.id, tasks);
      }
      
      return { 
        success: true, 
        deviceTask: nextTask
      };
    }

    return { success: true };
  }

  /**
   * Called when a hardware device reports a successful enrollment.
   * Saves the fingerprintId to the pending biometric record and marks it ACTIVE.
   */
  async processEnrollmentResult(
    deviceId: string,
    userId: string,
    fingerprintId: number,
    sensorType?: string,
  ) {
    console.log(`[Enrollment Result] Processing: device=${deviceId}, user=${userId}, fingerprintId=${fingerprintId}`);

    // Check for duplicate fingerprintId on this device
    const duplicate = await this.biometricRepository.findOne({
      where: { deviceId, fingerprintId, status: 'ACTIVE' },
    });

    if (duplicate && duplicate.userId !== userId) {
      console.warn(`[Enrollment Result] Duplicate fingerprint detected! fingerprintId=${fingerprintId} already belongs to userId=${duplicate.userId}`);
      // Mark the pending record as failed by deleting it
      const pendingBio = await this.biometricRepository.findOne({
        where: { deviceId, userId, status: 'PENDING' },
      });
      if (pendingBio) await this.biometricRepository.remove(pendingBio);
      return { success: false, reason: 'DUPLICATE_FINGERPRINT' };
    }

    // Find the pending biometric record for this user on this device
    const biometric = await this.biometricRepository.findOne({
      where: { deviceId, userId, status: 'PENDING' },
    });

    if (!biometric) {
      // No pending record — create one fresh (device-initiated enrollment)
      console.log(`[Enrollment Result] No pending record found, creating new one.`);
      const newBio = this.biometricRepository.create({
        userId,
        deviceId,
        fingerprintId,
        status: 'ACTIVE',
      });
      await this.biometricRepository.save(newBio);
      return { success: true };
    }

    biometric.fingerprintId = fingerprintId;
    biometric.status = 'ACTIVE';
    await this.biometricRepository.save(biometric);
    console.log(`[Enrollment Result] Successfully enrolled biometric id=${biometric.id} for userId=${userId}`);
    return { success: true };
  }

  async processSyncData(deviceId: string, fingerprintIds: number[]) {
    console.log(`[Sync Data] Device ${deviceId} synced ${fingerprintIds?.length} fingerprints.`);
    this.deviceSensorIdsMap.set(deviceId, fingerprintIds || []);
    return { success: true };
  }

  getSensorFingerprints(deviceId: string): number[] {
    return this.deviceSensorIdsMap.get(deviceId) || [];
  }
}
