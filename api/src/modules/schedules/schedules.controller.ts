import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { SchedulesService, CreateScheduleDto, UpdateScheduleDto } from './schedules.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service: SchedulesService) {}

  @ApiOperation({ summary: 'Create schedule (link course to day/time)' })
  @Post()
  create(@Body() dto: CreateScheduleDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all schedules' })
  @ApiQuery({ name: 'courseId', required: false })
  @Get()
  findAll(@Query('courseId') courseId?: string) {
    if (courseId) return this.service.findByCourse(courseId);
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get schedule by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update schedule' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateScheduleDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete schedule' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
