import { Controller, Post, Body } from '@nestjs/common';
import { SecurityService } from './security.service';
import { DeviceRegisterDto, DeviceAuthDto } from './dto/security.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Device Auth')
@Controller('device')
export class SecurityController {
  constructor(private readonly securityService: SecurityService) {}

  @Public()
  @ApiOperation({ summary: 'Generate credentials for a device (One time)' })
  @Post('register')
  register(@Body() registerDto: DeviceRegisterDto) {
    return this.securityService.register(registerDto);
  }

  @Public()
  @ApiOperation({ summary: 'Authenticate device and get tokens' })
  @Post('authenticate')
  authenticate(@Body() authDto: DeviceAuthDto) {
    return this.securityService.authenticate(authDto);
  }

  @Public()
  @ApiOperation({ summary: 'Refresh device token' })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.securityService.refresh(refreshToken);
  }
}
