import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { QuestionSequencesService } from './question-sequences.service';
import { CreateQuestionSequenceDto } from './dto/create-question-sequence.dto';
import { UpdateQuestionSequenceDto } from './dto/update-question-sequence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('question-sequences')
@UseGuards(JwtAuthGuard)
export class QuestionSequencesController {
  constructor(private readonly sequencesService: QuestionSequencesService) {}

  @Post()
  create(@Body() createSequenceDto: CreateQuestionSequenceDto) {
    return this.sequencesService.create(createSequenceDto);
  }

  @Post('reorder')
  reorder(
    @Body() body: { questionnaireId: string; sequences: { id: string; order: number }[] },
  ) {
    return this.sequencesService.reorderSequences(body.questionnaireId, body.sequences);
  }

  @Get()
  findAll(@Query('questionnaireId') questionnaireId?: string) {
    if (questionnaireId) {
      return this.sequencesService.findByQuestionnaire(questionnaireId);
    }
    return this.sequencesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sequencesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSequenceDto: UpdateQuestionSequenceDto) {
    return this.sequencesService.update(id, updateSequenceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sequencesService.remove(id);
  }
}
