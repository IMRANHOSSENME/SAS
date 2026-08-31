import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAllSettings() {
    return this.settingsService.getSettings();
  }

  @Get(':category')
  getCategorySettings(@Param('category') category: string) {
    return this.settingsService.getSettings(category);
  }

  @Put(':category')
  updateSettings(@Param('category') category: string, @Body() config: any) {
    return this.settingsService.updateSettings(category, config);
  }
}
