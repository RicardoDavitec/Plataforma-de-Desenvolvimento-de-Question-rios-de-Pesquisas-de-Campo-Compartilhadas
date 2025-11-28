import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionSequencesService } from './question-sequences.service';
import { QuestionSequencesController } from './question-sequences.controller';
import { QuestionSequence } from './entities/question-sequence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([QuestionSequence])],
  controllers: [QuestionSequencesController],
  providers: [QuestionSequencesService],
  exports: [QuestionSequencesService],
})
export class QuestionSequencesModule {}
