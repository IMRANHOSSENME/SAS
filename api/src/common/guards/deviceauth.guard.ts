import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { DevicesService } from '../../modules/devices/devices.service';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(private devicesService: DevicesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    const deviceUid = request.headers['x-device-uid'] as string;
    const deviceSecret = request.headers['x-device-secret'] as string;

    if (!deviceUid || !deviceSecret) {
      throw new UnauthorizedException('Missing device credentials (x-device-uid or x-device-secret)');
    }

    try {
      const device = await this.devicesService.validateDeviceAuth(deviceUid, deviceSecret);
      // Attach the authenticated device to the request object
      (request as any).device = device;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid device credentials');
    }
  }
}
