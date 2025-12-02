import { Injectable, NotFoundException } from '@nestjs/common';
import { Question } from './entities/question.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { FilterQuestionsDto } from './dto/filter-questions.dto';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  async create(createQuestionDto: CreateQuestionDto): Promise<any> {
    const { options, ...questionData } = createQuestionDto;

    return await this.prisma.question.create({
      data: {
        ...questionData,
        options: options ? JSON.stringify(options) : null,
      } as any,
      include: {
        author: true,
        subgroup: true,
      },
    });
  }

  async findAll(filters?: FilterQuestionsDto): Promise<any[]> {
    const where: any = {};

    if (filters) {
      if (filters.type) where.type = filters.type;
      if (filters.visibility) where.visibility = filters.visibility;
      if (filters.authorId) where.authorId = filters.authorId;
      if (filters.subgroupId) where.subgroupId = filters.subgroupId;
      if (filters.searchText) where.text = { contains: filters.searchText };
    }

    return await this.prisma.question.findMany({
      where,
      include: {
        author: true,
        subgroup: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<any> {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        author: true,
        subgroup: true,
        questionnaires: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Questão com ID ${id} não encontrada`);
    }

    return question;
  }

  async update(id: string, updateQuestionDto: UpdateQuestionDto): Promise<any> {
    await this.findOne(id);
    const { options, ...questionData } = updateQuestionDto;

    return await this.prisma.question.update({
      where: { id },
      data: {
        ...questionData,
        ...(options && { options: JSON.stringify(options) }),
      } as any,
      include: {
        author: true,
        subgroup: true,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.question.delete({ where: { id } });
  }

  async findSimilar(questionId: string, threshold: number = 0.5): Promise<any[]> {
    // Este método será implementado com o serviço de similaridade
    const question = await this.findOne(questionId);
    
    // Por enquanto, retorna questões do mesmo subgrupo
    return await this.prisma.question.findMany({
      where: {
        subgroupId: question.subgroupId,
        isActive: true,
      },
      include: {
        author: true,
        subgroup: true,
      },
      take: 10,
    });
  }
}
