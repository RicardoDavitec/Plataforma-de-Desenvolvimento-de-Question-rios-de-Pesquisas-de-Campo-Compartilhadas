import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Verificar se já existe uma função com esse nome
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Já existe uma função com este nome');
    }

    return await this.prisma.role.create({
      data: createRoleDto,
    });
  }

  async findAll() {
    return await this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Função não encontrada');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    // Verificar se existe
    await this.findOne(id);

    // Se o nome está sendo alterado, verificar duplicidade
    if (updateRoleDto.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('Já existe uma função com este nome');
      }
    }

    return await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string): Promise<void> {
    // Verificar se existe
    await this.findOne(id);
    
    await this.prisma.role.delete({
      where: { id },
    });
  }

  async seedRoles(): Promise<void> {
    const defaultRoles = [
      { name: 'Preceptor', description: 'Profissional que orienta e supervisiona alunos em atividades práticas' },
      { name: 'Professor', description: 'Docente responsável pelo ensino e orientação acadêmica' },
      { name: 'Aluno', description: 'Estudante em processo de formação acadêmica' },
      { name: 'Orientador', description: 'Profissional que orienta trabalhos acadêmicos e de pesquisa' },
      { name: 'Coordenador', description: 'Responsável pela coordenação de projetos ou programas' },
      { name: 'Pesquisador', description: 'Profissional dedicado à condução de pesquisas científicas' },
    ];

    for (const roleData of defaultRoles) {
      const existing = await this.prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (!existing) {
        await this.prisma.role.create({
          data: roleData,
        });
      }
    }
  }
}
