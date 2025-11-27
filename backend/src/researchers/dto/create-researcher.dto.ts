import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ResearcherRole } from '../entities/researcher.entity';

export class CreateResearcherDto {
  @ApiProperty({
    description: 'Nome completo do pesquisador',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Email do pesquisador (usado para login)',
    example: 'joao.silva@universidade.edu.br',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Senha do pesquisador (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'ID do subgrupo ao qual o pesquisador pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  subgroupId: string;

  @ApiProperty({
    description: 'Telefone do pesquisador',
    example: '(11) 98765-4321',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Instituição do pesquisador',
    example: 'Universidade Federal de São Paulo',
    required: false,
  })
  @IsString()
  @IsOptional()
  institution?: string;

  @ApiProperty({
    description: 'Função antiga do pesquisador no sistema (deprecated - use roleId)',
    enum: ResearcherRole,
    example: ResearcherRole.RESEARCHER,
    required: false,
    default: ResearcherRole.RESEARCHER,
  })
  @IsEnum(ResearcherRole)
  @IsOptional()
  role?: ResearcherRole;

  @ApiProperty({
    description: 'ID da função/ocupação do pesquisador',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  @IsOptional()
  roleId?: string;
}
