import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateQuestionSequenceDto } from './dto/create-question-sequence.dto';
import { UpdateQuestionSequenceDto } from './dto/update-question-sequence.dto';

@Injectable()
export class QuestionSequencesService {
  constructor(private prisma: PrismaService) {}

  async create(createSequenceDto: CreateQuestionSequenceDto) {
    return await this.prisma.questionSequence.create({
      data: createSequenceDto,
    });
  }

  async findAll() {
    return await this.prisma.questionSequence.findMany({
      include: {
        questionnaire: true,
        question: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async findByQuestionnaire(questionnaireId: string) {
    return await this.prisma.questionSequence.findMany({
      where: { questionnaireId },
      include: {
        question: {
          include: {
            subgroup: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const sequence = await this.prisma.questionSequence.findUnique({
      where: { id },
      include: {
        questionnaire: true,
        question: true,
      },
    });

    if (!sequence) {
      throw new NotFoundException(`Question Sequence with ID ${id} not found`);
    }

    return sequence;
  }

  async update(id: string, updateSequenceDto: UpdateQuestionSequenceDto) {
    await this.findOne(id);
    
    return await this.prisma.questionSequence.update({
      where: { id },
      data: updateSequenceDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.prisma.questionSequence.delete({
      where: { id },
    });
  }

  async reorderSequences(questionnaireId: string, sequences: { id: string; order: number }[]): Promise<void> {
    for (const seq of sequences) {
      await this.prisma.questionSequence.update({
        where: { id: seq.id },
        data: { order: seq.order },
      });
    }
  }
}
