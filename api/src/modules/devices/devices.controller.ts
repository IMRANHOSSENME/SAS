import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Ip } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto/device.dto';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { DeviceAuthGuard } from '../../common/guards/deviceauth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @ApiOperation({ summary: 'Register a new device' })
  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @ApiOperation({ summary: 'Get all devices' })
  @Get()
  findAll() {
    return this.devicesService.findAll();
  }

  @ApiOperation({ summary: 'Get device details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a device' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeviceDto: UpdateDeviceDto) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  @ApiOperation({ summary: 'Remove a device' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.devicesService.remove(id);
  }

  @ApiOperation({ summary: 'Enable device' })
  @Post(':id/enable')
  enable(@Param('id') id: string) {
    return this.devicesService.enable(id);
  }

  @ApiOperation({ summary: 'Disable a device' })
  @Post(':id/disable')
  disable(@Param('id') id: string) {
    return this.devicesService.disable(id);
  }

  @ApiOperation({ summary: 'Trigger biometric enrollment on device' })
  @Post(':id/enroll')
  enroll(@Param('id') id: string, @Body() body: { userId: string, type: string }) {
    return this.devicesService.setEnrollmentTask(id, body.userId, body.type);
  }

  @ApiOperation({ summary: 'Trigger sensor sync on device' })
  @Post(':id/sync')
  triggerSync(@Param('id') id: string) {
    return this.devicesService.setSyncTask(id);
  }

  @ApiOperation({ summary: 'Get device status' })
  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.devicesService.getStatus(id);
  }

  @ApiOperation({ summary: 'Get device events' })
  @Get(':id/events')
  getEvents(@Param('id') id: string) {
    return this.devicesService.getEvents(id);
  }

  @ApiOperation({ summary: 'Get live enrollment status for a device' })
  @Get(':id/enrollment-status')
  getEnrollmentStatus(@Param('id') id: string) {
    return this.devicesService.getEnrollmentStatus(id);
  }

  @Public()
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Device heartbeat ping' })
  @Post('heartbeat')
  async heartbeat(@Request() req: any, @Body() body: any, @Ip() ip: string) {
    const device = req.device;
    const payload = {
      ...body,
      ipAddress: ip,
    };
    const result = await this.devicesService.processHeartbeat(device.id, payload);
    // Return the full result so the device gets the enrollmentTask if pending
    return result;
  }

  @Public()
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Submit enrollment result from device after fingerprint scan' })
  @Post('enroll-result')
  async enrollResult(@Request() req: any, @Body() body: { userId: string; fingerprintId: number; sensorType?: string }) {
    const device = req.device;
    console.log(`[/devices/enroll-result] Received from device ${device.deviceUid}:`, body);
    return this.devicesService.processEnrollmentResult(
      device.id,
      body.userId,
      body.fingerprintId,
      body.sensorType,
    );
  }

  @Public()
  @UseGuards(DeviceAuthGuard)
  @ApiOperation({ summary: 'Submit sensor fingerprint sync data' })
  @Post('sync')
  async syncDeviceFingerprints(@Request() req: any, @Body() body: { fingerprintIds: number[] }) {
    const device = req.device;
    return this.devicesService.processSyncData(device.id, body.fingerprintIds);
  }
}
