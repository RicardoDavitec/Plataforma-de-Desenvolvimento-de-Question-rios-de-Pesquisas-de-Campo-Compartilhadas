import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFieldResearchDto } from './dto/create-field-research.dto';
import { UpdateFieldResearchDto } from './dto/update-field-research.dto';

@Injectable()
export class FieldResearchesService {
  constructor(private prisma: PrismaService) {}

  async create(createFieldResearchDto: CreateFieldResearchDto) {
    return await this.prisma.fieldResearch.create({
      data: createFieldResearchDto,
    });
  }

  async findAll() {
    return await this.prisma.fieldResearch.findMany({
      include: {
        subgroup: true,
        responsible: true,
        questionnaires: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySubgroup(subgroupId: string) {
    return await this.prisma.fieldResearch.findMany({
      where: { subgroupId },
      include: {
        responsible: true,
        questionnaires: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const fieldResearch = await this.prisma.fieldResearch.findUnique({
      where: { id },
      include: {
        subgroup: {
          include: {
            researchProject: {
              include: {
                institution: true,
              },
            },
          },
        },
        responsible: true,
        questionnaires: {
          include: {
            questionSequences: true,
          },
        },
      },
    });

    if (!fieldResearch) {
      throw new NotFoundException(`Field Research with ID ${id} not found`);
    }

    return fieldResearch;
  }

  async update(id: string, updateFieldResearchDto: UpdateFieldResearchDto) {
    await this.findOne(id);
    
    return await this.prisma.fieldResearch.update({
      where: { id },
      data: updateFieldResearchDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.prisma.fieldResearch.delete({
      where: { id },
    });
  }
}
