import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { BatchesService, CreateBatchDto, UpdateBatchDto } from './batches.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('batches')
export class BatchesController {
  constructor(private readonly service: BatchesService) {}

  @ApiOperation({ summary: 'Create batch' })
  @Post()
  create(@Body() dto: CreateBatchDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all batches' })
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Get batch by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update batch' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBatchDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete batch' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
