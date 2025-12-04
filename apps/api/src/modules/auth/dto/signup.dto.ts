import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsOptional, 
  Matches, 
  IsEnum, 
  IsUUID,
  MaxLength,
  IsNotEmpty 
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class SignUpDto {
  // User basic info
  @ApiProperty({ example: 'joao.silva@example.com', description: 'Email válido do usuário' })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @ApiProperty({ 
    example: 'Senha@123', 
    description: 'Senha com no mínimo 8 caracteres, incluindo letras, números e símbolos',
    minLength: 8 
  })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/, {
    message: 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial',
  })
  password: string;

  @ApiProperty({ example: '123.456.789-00', description: 'CPF no formato 000.000.000-00' })
  @IsString()
  @Matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, {
    message: 'CPF deve estar no formato 000.000.000-00',
  })
  cpf: string;

  @ApiProperty({ example: 'João Silva Santos', description: 'Nome completo do usuário' })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @ApiPropertyOptional({ example: '(11) 98765-4321', description: 'Telefone com DDD' })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (00) 00000-0000 ou (00) 0000-0000',
  })
  phone?: string;

  // Researcher info
  @ApiProperty({ 
    example: UserRole.PESQUISADOR, 
    enum: UserRole,
    description: 'Papel principal do usuário no sistema' 
  })
  @IsEnum(UserRole, { message: 'Papel de usuário inválido' })
  role: UserRole;

  @ApiProperty({ 
    example: 'uuid-da-instituicao', 
    description: 'ID da instituição principal onde o pesquisador atua' 
  })
  @IsUUID('4', { message: 'ID da instituição deve ser um UUID válido' })
  @IsNotEmpty({ message: 'Instituição principal é obrigatória' })
  primaryInstitutionId: string;

  @ApiPropertyOptional({ 
    example: 'uuid-da-instituicao-secundaria', 
    description: 'ID da instituição secundária (opcional)' 
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID da instituição secundária deve ser um UUID válido' })
  secondaryInstitutionId?: string;

  @ApiPropertyOptional({ 
    example: 'Doutor em Ciências da Saúde', 
    description: 'Titulação acadêmica do pesquisador' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  academicTitle?: string;

  @ApiPropertyOptional({ 
    example: '1234567890123456', 
    description: 'Número do Currículo Lattes (16 dígitos)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{16}$/, {
    message: 'Número do Lattes deve conter 16 dígitos',
  })
  lattesNumber?: string;

  @ApiPropertyOptional({ 
    example: '1234-5678-9012-3456', 
    description: 'Identificador ORCID do pesquisador' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{4}-\d{4}-\d{4}$/, {
    message: 'ORCID deve estar no formato 0000-0000-0000-0000',
  })
  orcidId?: string;

  @ApiPropertyOptional({ 
    example: 'Epidemiologia, Saúde Pública, Pesquisa Clínica', 
    description: 'Áreas de especialização do pesquisador' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialization?: string;
}
