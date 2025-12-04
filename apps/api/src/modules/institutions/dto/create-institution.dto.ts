import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsOptional, 
  Matches, 
  IsEmail,
  IsUUID,
  MaxLength,
  IsDateString 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InstitutionType } from '@prisma/client';

export class CreateInstitutionDto {
  @ApiProperty({ 
    example: '12.345.678/0001-90', 
    description: 'CNPJ da instituição no formato 00.000.000/0000-00' 
  })
  @IsString()
  @IsNotEmpty({ message: 'CNPJ é obrigatório' })
  @Matches(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, {
    message: 'CNPJ deve estar no formato 00.000.000/0000-00',
  })
  cnpj: string;

  @ApiProperty({ 
    example: 'Universidade Federal de São Paulo', 
    description: 'Nome completo da instituição' 
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiProperty({ 
    example: InstitutionType.ACADEMICA,
    enum: InstitutionType,
    description: 'Tipo da instituição' 
  })
  @IsEnum(InstitutionType, { message: 'Tipo de instituição inválido' })
  type: InstitutionType;

  @ApiProperty({ 
    example: 'uuid-do-coordenador', 
    description: 'ID do pesquisador coordenador da instituição' 
  })
  @IsUUID('4', { message: 'ID do coordenador deve ser um UUID válido' })
  @IsNotEmpty({ message: 'Coordenador é obrigatório' })
  coordinatorId: string;

  @ApiPropertyOptional({ 
    example: 'contato@unifesp.br', 
    description: 'Email institucional' 
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({ 
    example: '(11) 5576-4000', 
    description: 'Telefone institucional' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (00) 00000-0000 ou (00) 0000-0000',
  })
  phone?: string;

  @ApiPropertyOptional({ 
    example: 'https://www.unifesp.br', 
    description: 'Website institucional' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  website?: string;

  @ApiPropertyOptional({ 
    example: 'Rua Botucatu, 740', 
    description: 'Endereço completo' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiPropertyOptional({ 
    example: 'São Paulo', 
    description: 'Cidade' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ 
    example: 'SP', 
    description: 'Estado (UF)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Estado deve ser uma sigla válida (ex: SP, RJ, MG)',
  })
  state?: string;

  @ApiPropertyOptional({ 
    example: '04023-062', 
    description: 'CEP no formato 00000-000' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{5}-\d{3}$/, {
    message: 'CEP deve estar no formato 00000-000',
  })
  zipCode?: string;

  @ApiPropertyOptional({ 
    example: 'Brasil', 
    description: 'País' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ 
    example: 'Universidade pública federal focada em ciências da saúde e áreas correlatas', 
    description: 'Descrição da instituição' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ 
    example: '1933-01-01T00:00:00.000Z', 
    description: 'Data de fundação da instituição' 
  })
  @IsOptional()
  @IsDateString({}, { message: 'Data de fundação inválida' })
  foundedAt?: string;
}
