import { IsArray, ValidateNested, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuestionDto } from './create-question.dto';

export class ImportQuestionsDto {
  @ApiProperty({ 
    type: [CreateQuestionDto],
    description: 'Array de questões a serem importadas' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];

  @ApiPropertyOptional({ 
    example: 'IMPORTED_EXCEL', 
    description: 'Origem padrão para todas as questões (sobrescreve origin individual)' 
  })
  @IsOptional()
  @IsString()
  defaultOrigin?: string;

  @ApiPropertyOptional({ 
    example: 'uuid-do-grupo', 
    description: 'ID do grupo de pesquisa (opcional)' 
  })
  @IsOptional()
  @IsString()
  researchGroupId?: string;
}
