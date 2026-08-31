import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScanDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  fingerprintId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventId?: string;
}
