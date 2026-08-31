import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { ScanDto } from './dto/attendance.dto';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { DeviceAuthGuard } from '../../common/guards/deviceauth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) { }

  @ApiOperation({ summary: 'Submit fingerprint scan from device' })
  @Public() // Bypass global JWT guard since devices don't have JWTs
  @Post('scan')
  scan(@Body() scanDto: ScanDto) {
    return this.attendanceService.processScan(scanDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get live attendance feed for today' })
  @Get('live')
  getLiveFeed(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getLiveFeed(targetDate);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get attendance summary for a date' })
  @Get('summary')
  getSummary(@Query('date') date?: string) {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return this.attendanceService.getSummary(targetDate);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all attendance records' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'deviceId', required: false })
  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
    @Query('deviceId') deviceId?: string,
  ) {
    return this.attendanceService.findAll({ date, userId, deviceId });
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get attendance record by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get active session' })
  @Get('sessions/active')
  getActiveSession() {
    return this.attendanceService.getActiveSession();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create or update session settings' })
  @Post('sessions')
  createOrUpdateSession(@Body() sessionData: any) {
    return this.attendanceService.createOrUpdateSession(sessionData);
  }
}
