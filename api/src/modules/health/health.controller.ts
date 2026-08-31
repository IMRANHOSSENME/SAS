import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Check system health and connected devices' })
  @Get()
  checkStatus() {
    return this.healthService.checkStatus();
  }
}
