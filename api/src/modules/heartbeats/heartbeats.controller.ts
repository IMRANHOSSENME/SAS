import { Controller, Post, Body, Req } from '@nestjs/common';
import { HeartbeatsService } from './heartbeats.service';
import { CreateHeartbeatDto } from './dto/heartbeat.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Heartbeats')
@Controller('heartbeats')
export class HeartbeatsController {
  constructor(private readonly heartbeatsService: HeartbeatsService) {}

  @ApiOperation({ summary: 'Send a heartbeat from device' })
  @Post()
  create(@Body() createHeartbeatDto: CreateHeartbeatDto, @Req() req: Request) {
    const ip = req.ip || req.connection.remoteAddress;
    return this.heartbeatsService.create(createHeartbeatDto, ip || '');
  }
}
