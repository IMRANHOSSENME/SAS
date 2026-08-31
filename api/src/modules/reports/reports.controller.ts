import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @ApiOperation({ summary: 'Get daily attendance report' })
  @ApiQuery({ name: 'date', required: true, example: '2023-10-25' })
  @Get('daily')
  getDailyReport(@Query('date') date: string) {
    return this.reportsService.getDailyReport(date);
  }

  @ApiOperation({ summary: 'Get monthly attendance summary report' })
  @ApiQuery({ name: 'year', required: true, type: Number })
  @ApiQuery({ name: 'month', required: true, type: Number })
  @Get('monthly')
  getMonthlyReport(
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.reportsService.getMonthlyReport(parseInt(year, 10), parseInt(month, 10));
  }
}
