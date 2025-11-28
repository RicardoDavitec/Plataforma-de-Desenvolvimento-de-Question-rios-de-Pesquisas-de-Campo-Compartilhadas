import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from './entities/institution.entity';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>,
  ) {}

  async create(createInstitutionDto: CreateInstitutionDto): Promise<Institution> {
    const institution = this.institutionRepository.create(createInstitutionDto);
    return await this.institutionRepository.save(institution);
  }

  async findAll(): Promise<Institution[]> {
    return await this.institutionRepository.find({
      relations: ['projects'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Institution> {
    const institution = await this.institutionRepository.findOne({
      where: { id },
      relations: ['projects', 'projects.responsibleResearcher'],
    });

    if (!institution) {
      throw new NotFoundException(`Institution with ID ${id} not found`);
    }

    return institution;
  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto): Promise<Institution> {
    const institution = await this.findOne(id);
    Object.assign(institution, updateInstitutionDto);
    return await this.institutionRepository.save(institution);
  }

  async remove(id: string): Promise<void> {
    const institution = await this.findOne(id);
    await this.institutionRepository.remove(institution);
  }
}
