import { IsString, IsOptional, IsBoolean, IsDateString, IsInt, MaxLength } from 'class-validator';

export class CreateFieldResearchDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @IsOptional()
  @IsInt()
  targetSampleSize?: number;

  @IsOptional()
  @IsInt()
  currentSampleSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  methodology?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsString()
  expectedResults?: string;

  @IsOptional()
  @IsString()
  ethicsCommitteeApproval?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  subgroupId: string;

  @IsString()
  responsibleResearcherId: string;
}
