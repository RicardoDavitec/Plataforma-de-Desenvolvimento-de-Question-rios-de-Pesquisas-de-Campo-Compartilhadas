import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionSequenceDto } from './create-question-sequence.dto';

export class UpdateQuestionSequenceDto extends PartialType(CreateQuestionSequenceDto) {}
