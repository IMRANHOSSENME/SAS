import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Events')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiOperation({ summary: 'Get recent events' })
  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @ApiOperation({ summary: 'Get events for a specific device' })
  @Get('device/:deviceId')
  findByDevice(@Param('deviceId') deviceId: string) {
    return this.eventsService.findByDevice(deviceId);
  }
}
