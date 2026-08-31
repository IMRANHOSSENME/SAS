import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeartbeatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firmwareVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  wifiRssi?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  uptime?: number;
}
