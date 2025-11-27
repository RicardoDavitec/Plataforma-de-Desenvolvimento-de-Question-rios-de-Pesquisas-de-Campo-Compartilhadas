import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar se já existe uma função com esse nome
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Já existe uma função com este nome');
    }

    const role = this.rolesRepository.create(createRoleDto);
    return await this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return await this.rolesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Função não encontrada');
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Se o nome está sendo alterado, verificar duplicidade
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Já existe uma função com este nome');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.rolesRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
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
      const existing = await this.rolesRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existing) {
        const role = this.rolesRepository.create(roleData);
        await this.rolesRepository.save(role);
      }
    }
  }
}
