import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { FilterSurveysDto } from './dto/filter-surveys.dto';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async create(createSurveyDto: CreateSurveyDto) {
    const { responsibleId, ...data } = createSurveyDto;
    return await this.prisma.survey.create({
      data: {
        ...data,
        coordinatorId: responsibleId,
      } as any,
    });
  }

  async findAll(filters?: FilterSurveysDto) {
    const where: any = {};

    if (filters) {
      if (filters.status) where.status = filters.status;
      if (filters.applicationMethod) where.applicationMethod = filters.applicationMethod;
      if (filters.responsibleId) where.coordinatorId = filters.responsibleId;
      if (filters.questionnaireId) where.questionnaireId = filters.questionnaireId;
    }

    return await this.prisma.survey.findMany({
      where,
      include: {
        questionnaire: true,
        coordinator: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: {
        questionnaire: {
          include: {
            questions: true,
          },
        },
        coordinator: true,
      },
    });

    if (!survey) {
      throw new NotFoundException(`Pesquisa com ID ${id} não encontrada`);
    }

    return survey;
  }

  async update(id: string, updateSurveyDto: UpdateSurveyDto) {
    await this.findOne(id);
    const { responsibleId, ...data } = updateSurveyDto;
    
    return await this.prisma.survey.update({
      where: { id },
      data: {
        ...data,
        ...(responsibleId && { coordinatorId: responsibleId }),
      } as any,
    });
  }

  async incrementResponseCount(id: string) {
    return await this.prisma.survey.update({
      where: { id },
      data: {
        actualResponses: {
          increment: 1,
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.prisma.survey.delete({
      where: { id },
    });
  }
}
