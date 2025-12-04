import { 
  Injectable, 
  Logger, 
  NotFoundException, 
  BadRequestException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';

@Injectable()
export class InstitutionsService {
  private readonly logger = new Logger(InstitutionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova instituição
   */
  async create(createInstitutionDto: CreateInstitutionDto) {
    this.logger.log(`Criando instituição: ${createInstitutionDto.name}`);

    // Validação: Verificar se CNPJ já existe
    const cleanCnpj = this.cleanCnpj(createInstitutionDto.cnpj);
    const existingInstitution = await this.prisma.institution.findUnique({
      where: { cnpj: cleanCnpj },
    });

    if (existingInstitution) {
      throw new ConflictException('Já existe uma instituição cadastrada com este CNPJ');
    }

    // Validação: Verificar se coordenador existe e é um pesquisador
    const coordinator = await this.prisma.researcher.findUnique({
      where: { id: createInstitutionDto.coordinatorId },
      include: { user: true },
    });

    if (!coordinator) {
      throw new BadRequestException('Coordenador não encontrado ou não é um pesquisador');
    }

    try {
      const institution = await this.prisma.institution.create({
        data: {
          ...createInstitutionDto,
          cnpj: cleanCnpj,
          foundedAt: createInstitutionDto.foundedAt 
            ? new Date(createInstitutionDto.foundedAt) 
            : undefined,
        },
        include: {
          coordinator: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              primaryResearchers: true,
              secondaryResearchers: true,
              projects: true,
            },
          },
        },
      });

      this.logger.log(`Instituição criada: ${institution.id}`);
      return institution;
    } catch (error) {
      this.logger.error(`Erro ao criar instituição: ${error.message}`);
      throw new BadRequestException('Erro ao criar instituição');
    }
  }

  /**
   * Lista todas as instituições com filtros opcionais
   */
  async findAll(filters?: {
    type?: string;
    state?: string;
    city?: string;
    search?: string;
  }) {
    this.logger.log('Listando instituições');

    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.state) {
      where.state = filters.state;
    }

    if (filters?.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { cnpj: { contains: filters.search.replace(/\D/g, ''), mode: 'insensitive' } },
        { city: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const institutions = await this.prisma.institution.findMany({
      where,
      include: {
        coordinator: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            primaryResearchers: true,
            secondaryResearchers: true,
            projects: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return institutions.map(inst => ({
      ...inst,
      cnpj: this.formatCnpj(inst.cnpj),
    }));
  }

  /**
   * Busca uma instituição por ID
   */
  async findOne(id: string) {
    this.logger.log(`Buscando instituição: ${id}`);

    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        coordinator: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        primaryResearchers: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          take: 10,
        },
        projects: {
          select: {
            id: true,
            title: true,
            status: true,
            startDate: true,
            endDate: true,
          },
          take: 10,
        },
        _count: {
          select: {
            primaryResearchers: true,
            secondaryResearchers: true,
            projects: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    return {
      ...institution,
      cnpj: this.formatCnpj(institution.cnpj),
    };
  }

  /**
   * Atualiza uma instituição
   */
  async update(id: string, updateInstitutionDto: UpdateInstitutionDto) {
    this.logger.log(`Atualizando instituição: ${id}`);

    // Verificar se instituição existe
    const existingInstitution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!existingInstitution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    // Validação: Se mudando CNPJ, verificar duplicidade
    if (updateInstitutionDto.cnpj) {
      const cleanCnpj = this.cleanCnpj(updateInstitutionDto.cnpj);
      const duplicateCnpj = await this.prisma.institution.findFirst({
        where: {
          cnpj: cleanCnpj,
          NOT: { id },
        },
      });

      if (duplicateCnpj) {
        throw new ConflictException('Já existe uma instituição cadastrada com este CNPJ');
      }
    }

    // Validação: Se mudando coordenador, verificar se existe
    if (updateInstitutionDto.coordinatorId) {
      const coordinator = await this.prisma.researcher.findUnique({
        where: { id: updateInstitutionDto.coordinatorId },
      });

      if (!coordinator) {
        throw new BadRequestException('Coordenador não encontrado');
      }
    }

    try {
      const institution = await this.prisma.institution.update({
        where: { id },
        data: {
          ...updateInstitutionDto,
          cnpj: updateInstitutionDto.cnpj 
            ? this.cleanCnpj(updateInstitutionDto.cnpj) 
            : undefined,
          foundedAt: updateInstitutionDto.foundedAt 
            ? new Date(updateInstitutionDto.foundedAt) 
            : undefined,
        },
        include: {
          coordinator: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          _count: {
            select: {
              primaryResearchers: true,
              secondaryResearchers: true,
              projects: true,
            },
          },
        },
      });

      this.logger.log(`Instituição atualizada: ${id}`);
      return {
        ...institution,
        cnpj: this.formatCnpj(institution.cnpj),
      };
    } catch (error) {
      this.logger.error(`Erro ao atualizar instituição: ${error.message}`);
      throw new BadRequestException('Erro ao atualizar instituição');
    }
  }

  /**
   * Remove uma instituição (soft delete ou verifica dependências)
   */
  async remove(id: string) {
    this.logger.log(`Removendo instituição: ${id}`);

    const institution = await this.prisma.institution.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            primaryResearchers: true,
            secondaryResearchers: true,
            projects: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    // Verificar se possui dependências
    const totalDependencies = 
      institution._count.primaryResearchers +
      institution._count.secondaryResearchers +
      institution._count.projects;

    if (totalDependencies > 0) {
      throw new BadRequestException(
        `Não é possível remover a instituição. Existem ${institution._count.primaryResearchers} pesquisadores principais, ` +
        `${institution._count.secondaryResearchers} pesquisadores secundários e ` +
        `${institution._count.projects} projetos vinculados.`
      );
    }

    try {
      await this.prisma.institution.delete({
        where: { id },
      });

      this.logger.log(`Instituição removida: ${id}`);
      return { message: 'Instituição removida com sucesso' };
    } catch (error) {
      this.logger.error(`Erro ao remover instituição: ${error.message}`);
      throw new BadRequestException('Erro ao remover instituição');
    }
  }

  /**
   * Lista pesquisadores de uma instituição
   */
  async getResearchers(institutionId: string, isPrimary: boolean = true) {
    this.logger.log(`Listando pesquisadores da instituição: ${institutionId}`);

    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    const researchers = await this.prisma.researcher.findMany({
      where: isPrimary
        ? { primaryInstitutionId: institutionId }
        : { secondaryInstitutionId: institutionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    return researchers;
  }

  /**
   * Obtém estatísticas da instituição
   */
  async getStatistics(institutionId: string) {
    this.logger.log(`Obtendo estatísticas da instituição: ${institutionId}`);

    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        _count: {
          select: {
            primaryResearchers: true,
            secondaryResearchers: true,
            projects: true,
          },
        },
      },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada');
    }

    // Contar projetos por status
    const projectsByStatus = await this.prisma.project.groupBy({
      by: ['status'],
      where: { institutionId },
      _count: true,
    });

    return {
      totalPrimaryResearchers: institution._count.primaryResearchers,
      totalSecondaryResearchers: institution._count.secondaryResearchers,
      totalProjects: institution._count.projects,
      projectsByStatus: projectsByStatus.map(p => ({
        status: p.status,
        count: p._count,
      })),
    };
  }

  /**
   * Remove formatação do CNPJ (mantém apenas números)
   */
  private cleanCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  /**
   * Formata CNPJ para exibição (00.000.000/0000-00)
   */
  private formatCnpj(cnpj: string): string {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
}
