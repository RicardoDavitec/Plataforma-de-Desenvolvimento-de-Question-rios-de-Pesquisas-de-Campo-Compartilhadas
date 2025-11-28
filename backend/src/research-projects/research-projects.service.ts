import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ResearchProject } from './entities/research-project.entity';
import { CreateResearchProjectDto } from './dto/create-research-project.dto';
import { UpdateResearchProjectDto } from './dto/update-research-project.dto';

@Injectable()
export class ResearchProjectsService {
  constructor(
    @InjectRepository(ResearchProject)
    private projectRepository: Repository<ResearchProject>,
  ) {}

  async create(createProjectDto: CreateResearchProjectDto): Promise<ResearchProject> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      codeUUID: uuidv4(), // Gera UUID automaticamente
    });
    return await this.projectRepository.save(project);
  }

  async findAll(): Promise<ResearchProject[]> {
    return await this.projectRepository.find({
      relations: ['institution', 'responsibleResearcher', 'subgroups'],
      order: { name: 'ASC' },
    });
  }

  async findByInstitution(institutionId: string): Promise<ResearchProject[]> {
    return await this.projectRepository.find({
      where: { institutionId },
      relations: ['responsibleResearcher', 'subgroups'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ResearchProject> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['institution', 'responsibleResearcher', 'subgroups', 'subgroups.fieldResearches'],
    });

    if (!project) {
      throw new NotFoundException(`Research Project with ID ${id} not found`);
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateResearchProjectDto): Promise<ResearchProject> {
    const project = await this.findOne(id);
    Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(project);
  }

  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.remove(project);
  }
}
