import { Controller, Get, Post, Body, Param, Delete, UseGuards, UseInterceptors } from '@nestjs/common';
import { BiometricsService } from './biometrics.service';
import { EnrollDto, CompleteEnrollDto } from './dto/biometric.dto';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Biometrics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('biometrics')
export class BiometricsController {
  constructor(private readonly biometricsService: BiometricsService) {}

  @ApiOperation({ summary: 'Start enrollment process' })
  @Post('enroll')
  enroll(@Body() enrollDto: EnrollDto) {
    return this.biometricsService.enroll(enrollDto);
  }

  @ApiOperation({ summary: 'Complete enrollment' })
  @Post('enroll/:id/complete')
  completeEnroll(@Param('id') id: string, @Body() completeDto: CompleteEnrollDto) {
    return this.biometricsService.completeEnroll(id, completeDto);
  }

  @ApiOperation({ summary: 'Get all biometrics' })
  @Get()
  findAll() {
    return this.biometricsService.findAll();
  }

  @ApiOperation({ summary: 'Get biometric details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.biometricsService.findOne(id);
  }

  @ApiOperation({ summary: 'Remove biometric record' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.biometricsService.remove(id);
  }

  @ApiOperation({ summary: 'Get orphan fingerprints for device' })
  @Get('orphans/:deviceId')
  getOrphans(@Param('deviceId') deviceId: string) {
    return this.biometricsService.getOrphans(deviceId);
  }

  @ApiOperation({ summary: 'Remove orphan fingerprint from sensor' })
  @Delete('orphans/:deviceId/:fingerprintId')
  removeOrphan(@Param('deviceId') deviceId: string, @Param('fingerprintId') fingerprintId: number) {
    return this.biometricsService.removeOrphan(deviceId, fingerprintId);
  }
}
