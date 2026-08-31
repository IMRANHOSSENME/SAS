import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Register a new admin' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @ApiOperation({ summary: 'Admin login' })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @ApiOperation({ summary: 'Refresh access token' })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  @Get('me')
  getProfile(@Request() req: any) {
    return req.user;
  }
  
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout admin' })
  @Post('logout')
  logout() {
    // In stateless JWT, logout is usually handled client-side by deleting the token.
    // If you need token invalidation, you can implement a blacklist here.
    return { success: true, message: 'Logged out successfully' };
  }
}
