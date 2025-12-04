import { IsString, IsEnum, IsOptional, IsBoolean, IsNumber, IsArray, ValidateNested, IsJSON } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestionType, QuestionCategory, QuestionScope } from '@prisma/client';

export class CreateQuestionDto {
  @ApiProperty({ example: 'Qual é a sua idade?', description: 'Texto da questão' })
  @IsString()
  text: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.NUMERICA })
  @IsEnum(QuestionType)
  type: QuestionType;

  @ApiPropertyOptional({ enum: QuestionCategory, example: QuestionCategory.DEMOGRAFICA })
  @IsOptional()
  @IsEnum(QuestionCategory)
  category?: QuestionCategory;

  @ApiPropertyOptional({ enum: QuestionScope, example: QuestionScope.LOCAL })
  @IsOptional()
  @IsEnum(QuestionScope)
  scope?: QuestionScope;

  @ApiPropertyOptional({ example: true, description: 'Questão obrigatória' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: 0, description: 'Valor mínimo (para questões numéricas)' })
  @IsOptional()
  @IsNumber()
  minValue?: number;

  @ApiPropertyOptional({ example: 120, description: 'Valor máximo (para questões numéricas)' })
  @IsOptional()
  @IsNumber()
  maxValue?: number;

  @ApiPropertyOptional({ example: '^[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}$' })
  @IsOptional()
  @IsString()
  validationRegex?: string;

  @ApiPropertyOptional({ example: 'Digite apenas números' })
  @IsOptional()
  @IsString()
  helpText?: string;

  @ApiPropertyOptional({ 
    example: ['Sim', 'Não', 'Não sei'], 
    description: 'Opções para múltipla escolha (JSON array)' 
  })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiPropertyOptional({ example: 1, description: 'Valor mínimo da escala Likert' })
  @IsOptional()
  @IsNumber()
  likertMin?: number;

  @ApiPropertyOptional({ example: 5, description: 'Valor máximo da escala Likert' })
  @IsOptional()
  @IsNumber()
  likertMax?: number;

  @ApiPropertyOptional({ 
    example: ['Discordo totalmente', 'Discordo', 'Neutro', 'Concordo', 'Concordo totalmente'] 
  })
  @IsOptional()
  @IsArray()
  likertLabels?: string[];

  @ApiPropertyOptional({ example: 'Avaliar faixa etária da população estudada' })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({ example: 'Adultos maiores de 18 anos' })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional({ 
    example: 'MANUAL', 
    description: 'Origem da questão: MANUAL, AI_CLAUDE, IMPORTED_EXCEL, etc.' 
  })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({ example: 'uuid-do-grupo-pesquisa' })
  @IsOptional()
  @IsString()
  researchGroupId?: string;
}
