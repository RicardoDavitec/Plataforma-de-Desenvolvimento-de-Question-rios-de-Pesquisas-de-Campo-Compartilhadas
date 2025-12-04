import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { ProjectStatus, UserRole } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Criar novo projeto
   * Apenas usuários com roles específicas podem criar projetos
   */
  async create(createProjectDto: CreateProjectDto, userId: string) {
    this.logger.log(`Criando projeto: ${createProjectDto.title}`);

    // Validar se instituição existe
    const institution = await this.prisma.institution.findUnique({
      where: { id: createProjectDto.institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    // Validar datas
    const startDate = new Date(createProjectDto.startDate);
    if (createProjectDto.endDate) {
      const endDate = new Date(createProjectDto.endDate);
      if (endDate <= startDate) {
        throw new BadRequestException('Data de término deve ser posterior à data de início');
      }
    }

    // Validar protocolo CEP único se fornecido
    if (createProjectDto.cepProtocol) {
      const existingProject = await this.prisma.project.findUnique({
        where: { cepProtocol: createProjectDto.cepProtocol },
      });

      if (existingProject) {
        throw new BadRequestException(
          `Protocolo CEP "${createProjectDto.cepProtocol}" já está em uso por outro projeto`
        );
      }
    }

    // Validar coordenadores se fornecidos
    if (createProjectDto.coordinatorIds && createProjectDto.coordinatorIds.length > 0) {
      const coordinators = await this.prisma.researcher.findMany({
        where: { id: { in: createProjectDto.coordinatorIds } },
      });

      if (coordinators.length !== createProjectDto.coordinatorIds.length) {
        throw new BadRequestException('Um ou mais coordenadores não foram encontrados');
      }
    }

    // Criar projeto com coordenadores
    const { coordinatorIds, fundingAmount, ...projectData } = createProjectDto;

    const project = await this.prisma.project.create({
      data: {
        ...projectData,
        fundingAmount: fundingAmount ? new Decimal(fundingAmount) : null,
        coordinators: coordinatorIds
          ? {
              create: coordinatorIds.map((researcherId) => ({
                researcherId,
              })),
            }
          : undefined,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
        coordinators: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            researchGroups: true,
          },
        },
      },
    });

    this.logger.log(`Projeto criado: ${project.id}`);
    return project;
  }

  /**
   * Listar projetos com filtros
   */
  async findAll(filters?: {
    status?: ProjectStatus;
    institutionId?: string;
    researchArea?: string;
    search?: string;
  }) {
    this.logger.log('Listando projetos');

    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.institutionId) {
      where.institutionId = filters.institutionId;
    }

    if (filters?.researchArea) {
      where.researchArea = {
        contains: filters.researchArea,
        mode: 'insensitive',
      };
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { keywords: { hasSome: [filters.search] } },
      ];
    }

    const projects = await this.prisma.project.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
        coordinators: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            researchGroups: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return projects;
  }

  /**
   * Buscar projeto por ID
   */
  async findOne(id: string) {
    this.logger.log(`Buscando projeto: ${id}`);

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        institution: true,
        coordinators: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
        members: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        researchGroups: {
          include: {
            coordinator: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            _count: {
              select: {
                members: true,
                questionnaires: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  /**
   * Atualizar projeto
   */
  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    this.logger.log(`Atualizando projeto: ${id}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        coordinators: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Validar datas se fornecidas
    if (updateProjectDto.startDate || updateProjectDto.endDate) {
      const startDate = updateProjectDto.startDate
        ? new Date(updateProjectDto.startDate)
        : project.startDate;
      const endDate = updateProjectDto.endDate
        ? new Date(updateProjectDto.endDate)
        : project.endDate;

      if (endDate && endDate <= startDate) {
        throw new BadRequestException('Data de término deve ser posterior à data de início');
      }
    }

    // Validar protocolo CEP único se fornecido e diferente do atual
    if (updateProjectDto.cepProtocol && updateProjectDto.cepProtocol !== project.cepProtocol) {
      const existingProject = await this.prisma.project.findUnique({
        where: { cepProtocol: updateProjectDto.cepProtocol },
      });

      if (existingProject) {
        throw new BadRequestException(
          `Protocolo CEP "${updateProjectDto.cepProtocol}" já está em uso por outro projeto`
        );
      }
    }

    // Atualizar projeto
    const { fundingAmount, coordinatorIds, ...updateData } = updateProjectDto as any;

    const updatedProject = await this.prisma.project.update({
      where: { id },
      data: {
        ...updateData,
        fundingAmount: fundingAmount ? new Decimal(fundingAmount) : undefined,
      },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            acronym: true,
          },
        },
        coordinators: {
          include: {
            researcher: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            researchGroups: true,
          },
        },
      },
    });

    this.logger.log(`Projeto atualizado: ${id}`);
    return updatedProject;
  }

  /**
   * Remover projeto
   * Apenas se não tiver grupos de pesquisa ou membros
   */
  async remove(id: string, userId: string) {
    this.logger.log(`Removendo projeto: ${id}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            researchGroups: true,
            members: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar dependências
    if (project._count.researchGroups > 0 || project._count.members > 0) {
      throw new BadRequestException(
        `Não é possível deletar o projeto. Ele possui ${project._count.researchGroups} grupo(s) de pesquisa e ${project._count.members} membro(s) associado(s). Remova essas associações primeiro.`
      );
    }

    // Deletar projeto (coordenadores serão deletados em cascata)
    await this.prisma.project.delete({
      where: { id },
    });

    this.logger.log(`Projeto removido: ${id}`);
    return { message: 'Projeto removido com sucesso' };
  }

  /**
   * Adicionar coordenador ao projeto
   */
  async addCoordinator(projectId: string, researcherId: string, userId: string) {
    this.logger.log(`Adicionando coordenador ${researcherId} ao projeto ${projectId}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar se pesquisador existe
    const researcher = await this.prisma.researcher.findUnique({
      where: { id: researcherId },
    });

    if (!researcher) {
      throw new NotFoundException('Pesquisador não encontrado');
    }

    // Verificar se já é coordenador
    const existing = await this.prisma.projectCoordinator.findUnique({
      where: {
        projectId_researcherId: {
          projectId,
          researcherId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Pesquisador já é coordenador deste projeto');
    }

    // Adicionar coordenador
    const coordinator = await this.prisma.projectCoordinator.create({
      data: {
        projectId,
        researcherId,
      },
      include: {
        researcher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Coordenador adicionado: ${researcherId}`);
    return coordinator;
  }

  /**
   * Remover coordenador do projeto
   */
  async removeCoordinator(projectId: string, researcherId: string, userId: string) {
    this.logger.log(`Removendo coordenador ${researcherId} do projeto ${projectId}`);

    // Verificar se existe
    const coordinator = await this.prisma.projectCoordinator.findUnique({
      where: {
        projectId_researcherId: {
          projectId,
          researcherId,
        },
      },
    });

    if (!coordinator) {
      throw new NotFoundException('Coordenador não encontrado neste projeto');
    }

    // Verificar se não é o último coordenador
    const coordinatorCount = await this.prisma.projectCoordinator.count({
      where: { projectId },
    });

    if (coordinatorCount === 1) {
      throw new BadRequestException('Não é possível remover o único coordenador do projeto');
    }

    // Remover coordenador
    await this.prisma.projectCoordinator.delete({
      where: {
        projectId_researcherId: {
          projectId,
          researcherId,
        },
      },
    });

    this.logger.log(`Coordenador removido: ${researcherId}`);
    return { message: 'Coordenador removido com sucesso' };
  }

  /**
   * Adicionar membro ao projeto
   */
  async addMember(projectId: string, addMemberDto: AddProjectMemberDto, userId: string) {
    this.logger.log(`Adicionando membro ${addMemberDto.researcherId} ao projeto ${projectId}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    // Verificar se pesquisador existe
    const researcher = await this.prisma.researcher.findUnique({
      where: { id: addMemberDto.researcherId },
    });

    if (!researcher) {
      throw new NotFoundException('Pesquisador não encontrado');
    }

    // Verificar se já é membro
    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_researcherId: {
          projectId,
          researcherId: addMemberDto.researcherId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Pesquisador já é membro deste projeto');
    }

    // Adicionar membro
    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        researcherId: addMemberDto.researcherId,
        role: addMemberDto.role || UserRole.PESQUISADOR,
      },
      include: {
        researcher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Membro adicionado: ${addMemberDto.researcherId}`);
    return member;
  }

  /**
   * Remover membro do projeto
   */
  async removeMember(projectId: string, researcherId: string, userId: string) {
    this.logger.log(`Removendo membro ${researcherId} do projeto ${projectId}`);

    // Verificar se existe
    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_researcherId: {
          projectId,
          researcherId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado neste projeto');
    }

    // Remover membro
    await this.prisma.projectMember.delete({
      where: {
        projectId_researcherId: {
          projectId,
          researcherId,
        },
      },
    });

    this.logger.log(`Membro removido: ${researcherId}`);
    return { message: 'Membro removido com sucesso' };
  }

  /**
   * Listar membros do projeto
   */
  async getMembers(projectId: string) {
    this.logger.log(`Listando membros do projeto: ${projectId}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const members = await this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        researcher: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'asc',
      },
    });

    return members;
  }

  /**
   * Obter estatísticas do projeto
   */
  async getStatistics(projectId: string) {
    this.logger.log(`Obtendo estatísticas do projeto: ${projectId}`);

    // Verificar se projeto existe
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    const [coordinatorCount, memberCount, researchGroupCount] = await Promise.all([
      this.prisma.projectCoordinator.count({ where: { projectId } }),
      this.prisma.projectMember.count({ where: { projectId } }),
      this.prisma.researchGroup.count({ where: { projectId } }),
    ]);

    return {
      coordinators: coordinatorCount,
      members: memberCount,
      researchGroups: researchGroupCount,
      totalParticipants: coordinatorCount + memberCount,
    };
  }
}
