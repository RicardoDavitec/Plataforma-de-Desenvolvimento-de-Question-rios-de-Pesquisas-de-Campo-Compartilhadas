import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber, MaxLength } from 'class-validator';

export class CreateResearchProjectDto {
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  area?: string;

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
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fundingAgency?: string;

  @IsOptional()
  @IsString()
  objectives?: string;

  @IsOptional()
  @IsString()
  expectedResults?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  institutionId: string;

  @IsString()
  responsibleResearcherId: string;
}
