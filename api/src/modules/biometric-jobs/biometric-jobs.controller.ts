import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { BiometricJobsService } from './biometric-jobs.service';
import { CreateBiometricJobDto, JobResultDto } from './dto/biometric-job.dto';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { DeviceAuthGuard } from '../../common/guards/deviceauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Biometric Jobs')
@Controller('biometric-jobs')
export class BiometricJobsController {
  constructor(private readonly biometricJobsService: BiometricJobsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new enrollment or update job' })
  @Post()
  create(@Request() req: any, @Body() createDto: CreateBiometricJobDto) {
    // req.user contains the authenticated admin/teacher
    return this.biometricJobsService.createJob(req.user.id, createDto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all jobs' })
  @Get()
  findAll() {
    return this.biometricJobsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get job by id' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.biometricJobsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel pending job' })
  @Patch(':id/cancel')
  cancelJob(@Param('id') id: string) {
    return this.biometricJobsService.cancelJob(id);
  }

  @ApiOperation({ summary: 'Device reports job result' })
  @UseGuards(DeviceAuthGuard) // Device uses its token/hash
  @Post(':id/result')
  handleResult(@Param('id') id: string, @Body() resultDto: JobResultDto) {
    return this.biometricJobsService.handleDeviceResult(id, resultDto);
  }
}
