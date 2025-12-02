import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateResearchProjectDto } from './dto/create-research-project.dto';
import { UpdateResearchProjectDto } from './dto/update-research-project.dto';

@Injectable()
export class ResearchProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateResearchProjectDto) {
    return await this.prisma.researchProject.create({
      data: createProjectDto,
    });
  }

  async findAll() {
    return await this.prisma.researchProject.findMany({
      include: {
        institution: true,
        responsibleResearcher: true,
        subgroups: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByInstitution(institutionId: string) {
    return await this.prisma.researchProject.findMany({
      where: { institutionId },
      include: {
        responsibleResearcher: true,
        subgroups: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.researchProject.findUnique({
      where: { id },
      include: {
        institution: true,
        responsibleResearcher: true,
        subgroups: {
          include: {
            fieldResearches: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Research Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateResearchProjectDto) {
    await this.findOne(id);
    
    return await this.prisma.researchProject.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.prisma.researchProject.delete({
      where: { id },
    });
  }
}
