import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { CreateResearcherDto } from './dto/create-researcher.dto';
import { UpdateResearcherDto } from './dto/update-researcher.dto';

@Injectable()
export class ResearchersService {
  constructor(private prisma: PrismaService) {}

  async create(createResearcherDto: CreateResearcherDto) {
    // Verificar se o email já existe
    const existingResearcher = await this.prisma.researcher.findUnique({
      where: { email: createResearcherDto.email },
    });

    if (existingResearcher) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createResearcherDto.password, 10);

    return await this.prisma.researcher.create({
      data: {
        ...createResearcherDto,
        password: hashedPassword,
      },
    });
  }

  async findAll() {
    return await this.prisma.researcher.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        subgroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const researcher = await this.prisma.researcher.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        institution: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        subgroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!researcher) {
      throw new NotFoundException(`Pesquisador com ID ${id} não encontrado`);
    }

    return researcher;
  }

  async findByEmail(email: string) {
    return await this.prisma.researcher.findUnique({
      where: { email },
      include: {
        subgroup: true,
      },
    });
  }

  async update(id: string, updateResearcherDto: UpdateResearcherDto) {
    // Verificar se o pesquisador existe
    await this.findOne(id);
    
    // Se o email estiver sendo atualizado, verificar se já existe
    if (updateResearcherDto.email) {
      const existingResearcher = await this.prisma.researcher.findUnique({
        where: { email: updateResearcherDto.email },
      });

      if (existingResearcher && existingResearcher.id !== id) {
        throw new ConflictException('Email já cadastrado');
      }
    }

    return await this.prisma.researcher.update({
      where: { id },
      data: updateResearcherDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se o pesquisador existe
    await this.findOne(id);
    
    await this.prisma.researcher.delete({
      where: { id },
    });
  }
}
