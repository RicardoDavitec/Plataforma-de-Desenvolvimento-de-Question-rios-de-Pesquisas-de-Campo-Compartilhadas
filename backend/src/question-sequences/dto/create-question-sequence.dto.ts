import { IsString, IsOptional, IsBoolean, IsInt, MaxLength } from 'class-validator';

export class CreateQuestionSequenceDto {
  @IsString()
  questionnaireId: string;

  @IsString()
  questionId: string;

  @IsInt()
  order: number;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  conditionalLogic?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  helpText?: string;
}
