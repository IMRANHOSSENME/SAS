import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnrollDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fingerName?: string;
}

export class CompleteEnrollDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  fingerprintId: number;
}
