import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum JobType {
  ENROLL = 'ENROLL',
  UPDATE = 'UPDATE',
}

export class CreateBiometricJobDto {
  @ApiProperty({ example: 'uuid', description: 'User ID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'uuid', description: 'Device ID' })
  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({ enum: JobType, description: 'Type of job' })
  @IsEnum(JobType)
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: 57, description: 'Old fingerprint ID (required for UPDATE)' })
  @IsNumber()
  @IsOptional()
  oldFingerprintId?: number;
}

export class JobResultDto {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  success: boolean;

  @ApiPropertyOptional({ example: 57 })
  @IsNumber()
  @IsOptional()
  fingerprintId?: number;

  @ApiPropertyOptional({ example: 'ALREADY_EXISTS' })
  @IsString()
  @IsOptional()
  error?: string;
}
