import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { AttendancePoliciesService, CreatePolicyDto, UpdatePolicyDto } from './policies.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Attendance Policies')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('policies')
export class AttendancePoliciesController {
  constructor(private readonly service: AttendancePoliciesService) {}

  @ApiOperation({ summary: 'Create attendance policy' })
  @Post()
  create(@Body() dto: CreatePolicyDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all policies' })
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Get default policy' })
  @Get('default')
  getDefault() { return this.service.getDefault(); }

  @ApiOperation({ summary: 'Get policy by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update policy' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePolicyDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete policy' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
