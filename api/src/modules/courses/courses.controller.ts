import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { CoursesService, CreateCourseDto, UpdateCourseDto } from './courses.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly service: CoursesService) {}

  @ApiOperation({ summary: 'Create course' })
  @Post()
  create(@Body() dto: CreateCourseDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all courses' })
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Get course by ID with enrollments & schedules' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update course' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete course' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
