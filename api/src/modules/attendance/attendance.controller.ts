import { Controller, Get, Post, Body, Param, Patch, Query, UseGuards, Request } from '@nestjs/common';
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
  @UseGuards(DeviceAuthGuard)
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
  @ApiOperation({ summary: 'Submit attendance correction' })
  @Patch(':id/correct')
  correctAttendance(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { newStatus: string, reason: string }
  ) {
    return this.attendanceService.correctAttendance(id, body.newStatus, body.reason, req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get correction history for a record' })
  @Get(':id/corrections')
  getCorrections(@Param('id') id: string) {
    return this.attendanceService.getCorrections(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get active sessions' })
  @Get('sessions')
  getSessions() {
    return this.attendanceService.getSessions();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually open session' })
  @Post('sessions/:id/open')
  openSession(@Param('id') id: string) {
    return this.attendanceService.updateSessionStatus(id, 'OPEN');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually close session' })
  @Post('sessions/:id/close')
  closeSession(@Param('id') id: string) {
    return this.attendanceService.updateSessionStatus(id, 'CLOSED');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Manually cancel session' })
  @Post('sessions/:id/cancel')
  cancelSession(@Param('id') id: string) {
    return this.attendanceService.updateSessionStatus(id, 'CANCELLED');
  }
}
