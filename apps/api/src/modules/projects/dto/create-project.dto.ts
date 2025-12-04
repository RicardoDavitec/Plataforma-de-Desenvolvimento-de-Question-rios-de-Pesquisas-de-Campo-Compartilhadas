import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsArray,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Título do projeto',
    example: 'Pesquisa sobre Qualidade de Vida em Comunidades Rurais',
    minLength: 10,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'Título é obrigatório' })
  @MinLength(10, { message: 'Título deve ter no mínimo 10 caracteres' })
  @MaxLength(200, { message: 'Título deve ter no máximo 200 caracteres' })
  title: string;

  @ApiPropertyOptional({
    description: 'Descrição detalhada do projeto',
    example: 'Este projeto visa investigar os fatores que influenciam a qualidade de vida...',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Descrição deve ter no máximo 5000 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status do projeto',
    enum: ProjectStatus,
    default: ProjectStatus.EM_ANDAMENTO,
  })
  @IsEnum(ProjectStatus, { message: 'Status inválido' })
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Número do protocolo CEP (Comitê de Ética em Pesquisa)',
    example: 'CAAE: 12345678.9.0000.5555',
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Protocolo CEP deve ter no máximo 100 caracteres' })
  cepProtocol?: string;

  @ApiPropertyOptional({
    description: 'Área de pesquisa do projeto',
    example: 'Saúde Pública',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Área de pesquisa deve ter no máximo 200 caracteres' })
  researchArea?: string;

  @ApiPropertyOptional({
    description: 'Palavras-chave do projeto',
    example: ['qualidade de vida', 'saúde pública', 'zona rural'],
    type: [String],
  })
  @IsArray({ message: 'Keywords deve ser um array' })
  @IsString({ each: true, message: 'Cada keyword deve ser uma string' })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({
    description: 'Agência financiadora',
    example: 'CNPq - Conselho Nacional de Desenvolvimento Científico e Tecnológico',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Agência financiadora deve ter no máximo 200 caracteres' })
  fundingAgency?: string;

  @ApiPropertyOptional({
    description: 'Valor do financiamento',
    example: 50000.00,
    minimum: 0,
  })
  @IsNumber({}, { message: 'Valor do financiamento deve ser numérico' })
  @Min(0, { message: 'Valor do financiamento deve ser maior ou igual a zero' })
  @IsOptional()
  @Type(() => Number)
  fundingAmount?: number;

  @ApiProperty({
    description: 'Data de início do projeto',
    example: '2025-01-15',
    type: String,
    format: 'date',
  })
  @IsDateString({}, { message: 'Data de início inválida' })
  @IsNotEmpty({ message: 'Data de início é obrigatória' })
  startDate: string;

  @ApiPropertyOptional({
    description: 'Data de término prevista do projeto',
    example: '2026-12-31',
    type: String,
    format: 'date',
  })
  @IsDateString({}, { message: 'Data de término inválida' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Metodologia do projeto',
    example: 'Estudo observacional transversal com coleta de dados primários...',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Metodologia deve ter no máximo 5000 caracteres' })
  methodology?: string;

  @ApiPropertyOptional({
    description: 'Objetivos do projeto',
    example: 'Objetivo Geral: Avaliar a qualidade de vida...\nObjetivos Específicos: 1) ...',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Objetivos devem ter no máximo 5000 caracteres' })
  objectives?: string;

  @ApiPropertyOptional({
    description: 'Cronograma do projeto',
    example: 'Fase 1 (Jan-Mar): Revisão bibliográfica\nFase 2 (Abr-Jun): Coleta de dados...',
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000, { message: 'Cronograma deve ter no máximo 5000 caracteres' })
  schedule?: string;

  @ApiProperty({
    description: 'ID da instituição responsável pelo projeto',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'ID da instituição deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID da instituição é obrigatório' })
  institutionId: string;

  @ApiPropertyOptional({
    description: 'IDs dos coordenadores do projeto',
    example: ['123e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174002'],
    type: [String],
  })
  @IsArray({ message: 'IDs dos coordenadores deve ser um array' })
  @IsUUID('4', { each: true, message: 'Cada ID de coordenador deve ser um UUID válido' })
  @IsOptional()
  coordinatorIds?: string[];
}
