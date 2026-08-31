import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { DepartmentsService, CreateDepartmentDto, UpdateDepartmentDto } from './departments.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Departments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

  @ApiOperation({ summary: 'Create department' })
  @Post()
  create(@Body() dto: CreateDepartmentDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all departments' })
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Get department by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update department' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete department' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
