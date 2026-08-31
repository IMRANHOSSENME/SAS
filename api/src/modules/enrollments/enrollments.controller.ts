import { Controller, Get, Post, Body, Param, Patch, Delete, Query, UseGuards } from '@nestjs/common';
import { EnrollmentsService, CreateEnrollmentDto } from './enrollments.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Enrollments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @ApiOperation({ summary: 'Enroll student in a course' })
  @Post()
  create(@Body() dto: CreateEnrollmentDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all enrollments' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @Get()
  findAll(@Query('courseId') courseId?: string, @Query('userId') userId?: string) {
    if (courseId) return this.service.findByCourse(courseId);
    if (userId) return this.service.findByUser(userId);
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get enrollment by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Drop enrollment (status → DROPPED)' })
  @Patch(':id/drop')
  drop(@Param('id') id: string) { return this.service.drop(id); }

  @ApiOperation({ summary: 'Remove enrollment permanently' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
