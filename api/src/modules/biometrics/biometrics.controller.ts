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

}
