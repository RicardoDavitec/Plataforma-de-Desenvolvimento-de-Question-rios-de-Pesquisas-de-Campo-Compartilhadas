import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSubgroupDto } from './dto/create-subgroup.dto';
import { UpdateSubgroupDto } from './dto/update-subgroup.dto';

@Injectable()
export class SubgroupsService {
  constructor(private prisma: PrismaService) {}

  async create(createSubgroupDto: CreateSubgroupDto) {
    return await this.prisma.subgroup.create({
      data: createSubgroupDto,
    });
  }

  async findAll() {
    return await this.prisma.subgroup.findMany();
  }

  async findByProject(researchProjectId: string) {
    return await this.prisma.subgroup.findMany({
      where: { researchProjectId },
    });
  }

  async findOne(id: string) {
    const subgroup = await this.prisma.subgroup.findUnique({
      where: { id },
    });

    if (!subgroup) {
      throw new NotFoundException(`Subgrupo com ID ${id} não encontrado`);
    }

    return subgroup;
  }

  async update(id: string, updateSubgroupDto: UpdateSubgroupDto) {
    await this.findOne(id);
    
    return await this.prisma.subgroup.update({
      where: { id },
      data: updateSubgroupDto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    
    await this.prisma.subgroup.delete({
      where: { id },
    });
  }
}
