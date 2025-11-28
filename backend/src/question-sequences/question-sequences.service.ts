import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionSequence } from './entities/question-sequence.entity';
import { CreateQuestionSequenceDto } from './dto/create-question-sequence.dto';
import { UpdateQuestionSequenceDto } from './dto/update-question-sequence.dto';

@Injectable()
export class QuestionSequencesService {
  constructor(
    @InjectRepository(QuestionSequence)
    private sequenceRepository: Repository<QuestionSequence>,
  ) {}

  async create(createSequenceDto: CreateQuestionSequenceDto): Promise<QuestionSequence> {
    const sequence = this.sequenceRepository.create(createSequenceDto);
    return await this.sequenceRepository.save(sequence);
  }

  async findAll(): Promise<QuestionSequence[]> {
    return await this.sequenceRepository.find({
      relations: ['questionnaire', 'question'],
      order: { order: 'ASC' },
    });
  }

  async findByQuestionnaire(questionnaireId: string): Promise<QuestionSequence[]> {
    return await this.sequenceRepository.find({
      where: { questionnaireId },
      relations: ['question', 'question.subgroup'],
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<QuestionSequence> {
    const sequence = await this.sequenceRepository.findOne({
      where: { id },
      relations: ['questionnaire', 'question'],
    });

    if (!sequence) {
      throw new NotFoundException(`Question Sequence with ID ${id} not found`);
    }

    return sequence;
  }

  async update(id: string, updateSequenceDto: UpdateQuestionSequenceDto): Promise<QuestionSequence> {
    const sequence = await this.findOne(id);
    Object.assign(sequence, updateSequenceDto);
    return await this.sequenceRepository.save(sequence);
  }

  async remove(id: string): Promise<void> {
    const sequence = await this.findOne(id);
    await this.sequenceRepository.remove(sequence);
  }

  async reorderSequences(questionnaireId: string, sequences: { id: string; order: number }[]): Promise<void> {
    for (const seq of sequences) {
      await this.sequenceRepository.update(seq.id, { order: seq.order });
    }
  }
}
