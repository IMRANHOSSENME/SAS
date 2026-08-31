import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { SectionsService, CreateSectionDto, UpdateSectionDto } from './sections.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Sections')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sections')
export class SectionsController {
  constructor(private readonly service: SectionsService) {}

  @ApiOperation({ summary: 'Create section' })
  @Post()
  create(@Body() dto: CreateSectionDto) { return this.service.create(dto); }

  @ApiOperation({ summary: 'Get all sections' })
  @Get()
  findAll() { return this.service.findAll(); }

  @ApiOperation({ summary: 'Get section by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @ApiOperation({ summary: 'Update section' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSectionDto) { return this.service.update(id, dto); }

  @ApiOperation({ summary: 'Delete section' })
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
