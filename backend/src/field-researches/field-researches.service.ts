import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldResearch } from './entities/field-research.entity';
import { CreateFieldResearchDto } from './dto/create-field-research.dto';
import { UpdateFieldResearchDto } from './dto/update-field-research.dto';

@Injectable()
export class FieldResearchesService {
  constructor(
    @InjectRepository(FieldResearch)
    private fieldResearchRepository: Repository<FieldResearch>,
  ) {}

  async create(createFieldResearchDto: CreateFieldResearchDto): Promise<FieldResearch> {
    const fieldResearch = this.fieldResearchRepository.create(createFieldResearchDto);
    return await this.fieldResearchRepository.save(fieldResearch);
  }

  async findAll(): Promise<FieldResearch[]> {
    return await this.fieldResearchRepository.find({
      relations: ['subgroup', 'responsibleResearcher', 'questionnaires'],
      order: { name: 'ASC' },
    });
  }

  async findBySubgroup(subgroupId: string): Promise<FieldResearch[]> {
    return await this.fieldResearchRepository.find({
      where: { subgroupId },
      relations: ['responsibleResearcher', 'questionnaires'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<FieldResearch> {
    const fieldResearch = await this.fieldResearchRepository.findOne({
      where: { id },
      relations: [
        'subgroup',
        'subgroup.researchProject',
        'subgroup.researchProject.institution',
        'responsibleResearcher',
        'questionnaires',
        'questionnaires.questionSequences',
      ],
    });

    if (!fieldResearch) {
      throw new NotFoundException(`Field Research with ID ${id} not found`);
    }

    return fieldResearch;
  }

  async update(id: string, updateFieldResearchDto: UpdateFieldResearchDto): Promise<FieldResearch> {
    const fieldResearch = await this.findOne(id);
    Object.assign(fieldResearch, updateFieldResearchDto);
    return await this.fieldResearchRepository.save(fieldResearch);
  }

  async remove(id: string): Promise<void> {
    const fieldResearch = await this.findOne(id);
    await this.fieldResearchRepository.remove(fieldResearch);
  }
}
