import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwtauth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'department', required: false })
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('department') department?: string,
  ) {
    return this.usersService.findAll(search, department);
  }

  @ApiOperation({ summary: 'Get user details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a user' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: 'Deactivate user' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiOperation({ summary: 'Get user biometrics' })
  @Get(':id/biometrics')
  getBiometrics(@Param('id') id: string) {
    return this.usersService.getBiometrics(id);
  }

  @ApiOperation({ summary: 'Get user attendance' })
  @Get(':id/attendance')
  getAttendance(@Param('id') id: string) {
    // We can inject AttendanceService here or just handle it via the relations
    // For now returning a placeholder. Full implementation happens in attendance module
    return { message: 'Use the /attendance endpoint with userId filter' };
  }
}
