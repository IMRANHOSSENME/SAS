import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceUid: string;
}

export class DeviceAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceUid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceSecret: string;
}
