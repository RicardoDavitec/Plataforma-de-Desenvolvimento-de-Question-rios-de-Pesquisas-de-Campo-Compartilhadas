import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldResearchDto } from './create-field-research.dto';

export class UpdateFieldResearchDto extends PartialType(CreateFieldResearchDto) {}
