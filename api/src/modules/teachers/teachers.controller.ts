import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { TeachersService, CreateTeacherDto, UpdateTeacherDto } from './teachers.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly service: TeachersService) {}

  @ApiOperation({ summary: 'Create teacher' })
  @Post()
  create(@Body() dto: CreateTeacherDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all teachers' })
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Get teacher by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update teacher' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTeacherDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete teacher' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
