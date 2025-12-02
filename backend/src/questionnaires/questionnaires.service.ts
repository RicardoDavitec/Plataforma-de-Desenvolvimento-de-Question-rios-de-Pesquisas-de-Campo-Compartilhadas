import { Injectable, NotFoundException } from '@nestjs/common';
import { Questionnaire } from './entities/questionnaire.entity';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { UpdateQuestionnaireDto } from './dto/update-questionnaire.dto';
import { AddQuestionsDto } from './dto/add-questions.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuestionnairesService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionnaireDto: CreateQuestionnaireDto): Promise<any> {
    const { questionIds, ...questionnaireData } = createQuestionnaireDto;

    return await this.prisma.questionnaire.create({
      data: {
        ...questionnaireData,
        ...(questionIds && questionIds.length > 0 && {
          questions: {
            connect: questionIds.map((id) => ({ id })),
          },
        }),
      } as any,
      include: {
        creator: true,
        subgroup: true,
        questions: true,
      },
    });
  }

  async findAll(): Promise<any[]> {
    return await this.prisma.questionnaire.findMany({
      include: {
        creator: true,
        subgroup: true,
        questions: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const questionnaire = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        creator: true,
        subgroup: true,
        questions: true,
        surveys: true,
      },
    });

    if (!questionnaire) {
      throw new NotFoundException(`Questionário com ID ${id} não encontrado`);
    }

    return questionnaire;
  }

  async update(
    id: string,
    updateQuestionnaireDto: UpdateQuestionnaireDto,
  ): Promise<any> {
    await this.findOne(id);
    const { questionIds, ...questionnaireData } = updateQuestionnaireDto;

    // Se questionIds foi fornecido, substitui todas as questões
    if (questionIds) {
      await this.prisma.questionnaire.update({
        where: { id },
        data: {
          questions: {
            set: [],
          },
        },
      });
    }

    return await this.prisma.questionnaire.update({
      where: { id },
      data: {
        ...questionnaireData,
        ...(questionIds && {
          questions: {
            connect: questionIds.map((id) => ({ id })),
          },
        }),
      } as any,
      include: {
        creator: true,
        subgroup: true,
        questions: true,
      },
    });
  }

  async addQuestions(id: string, addQuestionsDto: AddQuestionsDto): Promise<any> {
    await this.findOne(id);

    // Busca questões existentes para evitar duplicatas
    const existing = await this.prisma.questionnaire.findUnique({
      where: { id },
      include: {
        questions: {
          select: { id: true },
        },
      },
    });

    const existingIds = new Set(existing.questions.map((q) => q.id));
    const newQuestionIds = addQuestionsDto.questionIds.filter((qid) => !existingIds.has(qid));

    if (newQuestionIds.length === 0) {
      return this.findOne(id);
    }

    return await this.prisma.questionnaire.update({
      where: { id },
      data: {
        questions: {
          connect: newQuestionIds.map((id) => ({ id })),
        },
      },
      include: {
        creator: true,
        subgroup: true,
        questions: true,
      },
    });
  }

  async removeQuestion(id: string, questionId: string): Promise<any> {
    await this.findOne(id);

    return await this.prisma.questionnaire.update({
      where: { id },
      data: {
        questions: {
          disconnect: { id: questionId },
        },
      },
      include: {
        creator: true,
        subgroup: true,
        questions: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.questionnaire.delete({ where: { id } });
  }
}
