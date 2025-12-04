import { 
  Injectable, 
  NotFoundException, 
  BadRequestException,
  Logger,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cria uma nova questão
   */
  async create(userId: string, createQuestionDto: CreateQuestionDto) {
    // Buscar researcher ID do usuário
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { researcher: true },
    });

    if (!user?.researcher) {
      throw new BadRequestException('Usuário não possui perfil de pesquisador');
    }

    try {
      const question = await this.prisma.question.create({
        data: {
          ...createQuestionDto,
          creatorId: user.researcher.id,
          options: createQuestionDto.options ? createQuestionDto.options : undefined,
          likertLabels: createQuestionDto.likertLabels ? createQuestionDto.likertLabels : undefined,
        },
        include: {
          creator: {
            select: {
              id: true,
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
          researchGroup: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(`Questão criada: ${question.id} por usuário ${userId}`);
      return question;
    } catch (error) {
      this.logger.error(`Erro ao criar questão: ${error.message}`);
      throw new BadRequestException('Erro ao criar questão');
    }
  }

  /**
   * Importa múltiplas questões de uma vez
   */
  async importQuestions(userId: string, importDto: ImportQuestionsDto) {
    this.logger.log(`Iniciando importação de ${importDto.questions.length} questões`);

    const results = {
      success: [] as any[],
      failed: [] as any[],
      total: importDto.questions.length,
    };

    for (const [index, questionDto] of importDto.questions.entries()) {
      try {
        // Aplicar valores padrão se fornecidos
        const finalDto = {
          ...questionDto,
          origin: importDto.defaultOrigin || questionDto.origin || 'IMPORTED',
          researchGroupId: importDto.researchGroupId || questionDto.researchGroupId,
        };

        const question = await this.create(userId, finalDto);
        
        results.success.push({
          index,
          id: question.id,
          text: question.text,
        });
      } catch (error) {
        this.logger.warn(`Falha ao importar questão ${index}: ${error.message}`);
        results.failed.push({
          index,
          text: questionDto.text,
          error: error.message,
        });
      }
    }

    this.logger.log(
      `Importação concluída: ${results.success.length} sucesso, ${results.failed.length} falhas`
    );

    return results;
  }

  /**
   * Lista todas as questões com filtros opcionais
   */
  async findAll(filters?: {
    type?: string;
    category?: string;
    scope?: string;
    creatorId?: string;
    researchGroupId?: string;
    origin?: string;
  }) {
    return this.prisma.question.findMany({
      where: {
        type: filters?.type as any,
        category: filters?.category as any,
        scope: filters?.scope as any,
        creatorId: filters?.creatorId,
        researchGroupId: filters?.researchGroupId,
        origin: filters?.origin,
      },
      include: {
        creator: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        researchGroup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Busca uma questão por ID
   */
  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            primaryInstitution: {
              select: {
                name: true,
                type: true,
              },
            },
          },
        },
        researchGroup: true,
        parent: {
          select: {
            id: true,
            text: true,
            version: true,
          },
        },
        versions: {
          select: {
            id: true,
            text: true,
            version: true,
            createdAt: true,
          },
        },
      },
    });

    if (!question) {
      throw new NotFoundException(`Questão com ID ${id} não encontrada`);
    }

    return question;
  }

  /**
   * Atualiza uma questão existente (cria nova versão)
   */
  async update(id: string, userId: string, updateQuestionDto: UpdateQuestionDto) {
    const existingQuestion = await this.findOne(id);

    // Verificar se usuário é o criador
    if (existingQuestion.creatorId !== userId) {
      throw new BadRequestException('Apenas o criador pode atualizar a questão');
    }

    // Criar nova versão da questão
    const newVersion = await this.prisma.question.create({
      data: {
        text: updateQuestionDto.text !== undefined ? updateQuestionDto.text : existingQuestion.text,
        type: updateQuestionDto.type !== undefined ? updateQuestionDto.type : existingQuestion.type,
        category: updateQuestionDto.category !== undefined ? updateQuestionDto.category : existingQuestion.category,
        scope: updateQuestionDto.scope !== undefined ? updateQuestionDto.scope : existingQuestion.scope,
        isRequired: updateQuestionDto.isRequired !== undefined ? updateQuestionDto.isRequired : existingQuestion.isRequired,
        minValue: updateQuestionDto.minValue !== undefined ? updateQuestionDto.minValue : existingQuestion.minValue,
        maxValue: updateQuestionDto.maxValue !== undefined ? updateQuestionDto.maxValue : existingQuestion.maxValue,
        validationRegex: updateQuestionDto.validationRegex !== undefined ? updateQuestionDto.validationRegex : existingQuestion.validationRegex,
        helpText: updateQuestionDto.helpText !== undefined ? updateQuestionDto.helpText : existingQuestion.helpText,
        options: updateQuestionDto.options !== undefined ? updateQuestionDto.options : existingQuestion.options,
        likertMin: updateQuestionDto.likertMin !== undefined ? updateQuestionDto.likertMin : existingQuestion.likertMin,
        likertMax: updateQuestionDto.likertMax !== undefined ? updateQuestionDto.likertMax : existingQuestion.likertMax,
        likertLabels: updateQuestionDto.likertLabels !== undefined ? updateQuestionDto.likertLabels : existingQuestion.likertLabels,
        objective: updateQuestionDto.objective !== undefined ? updateQuestionDto.objective : existingQuestion.objective,
        targetAudience: updateQuestionDto.targetAudience !== undefined ? updateQuestionDto.targetAudience : existingQuestion.targetAudience,
        creatorId: userId,
        parentId: existingQuestion.parentId || existingQuestion.id,
        version: existingQuestion.version + 1,
        origin: existingQuestion.origin,
        researchGroupId: updateQuestionDto.researchGroupId !== undefined ? updateQuestionDto.researchGroupId : existingQuestion.researchGroupId,
      },
      include: {
        creator: {
          select: {
            id: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        parent: true,
      },
    });

    this.logger.log(`Nova versão criada: ${newVersion.id} (v${newVersion.version})`);
    return newVersion;
  }

  /**
   * Remove uma questão (soft delete - marca como inativa)
   */
  async remove(id: string, userId: string) {
    const question = await this.findOne(id);

    // Verificar se usuário é o criador
    if (question.creatorId !== userId) {
      throw new BadRequestException('Apenas o criador pode remover a questão');
    }

    // Verificar se questão está em uso em questionários
    const usageCount = await this.prisma.questionnaireQuestion.count({
      where: { questionId: id },
    });

    if (usageCount > 0) {
      throw new ConflictException(
        `Questão não pode ser removida pois está em uso em ${usageCount} questionário(s)`
      );
    }

    await this.prisma.question.delete({
      where: { id },
    });

    this.logger.log(`Questão removida: ${id}`);
    return { message: 'Questão removida com sucesso' };
  }

  /**
   * Busca questões similares (placeholder para quando pgVector estiver disponível)
   */
  async findSimilar(text: string, limit: number = 10) {
    this.logger.warn('Busca por similaridade não disponível (pgVector não instalado)');
    
    // Busca simplificada por palavras-chave enquanto pgVector não está disponível
    const words = text.toLowerCase().split(' ').filter(w => w.length > 3);
    
    if (words.length === 0) {
      return [];
    }

    const questions = await this.prisma.question.findMany({
      where: {
        OR: words.map(word => ({
          text: {
            contains: word,
            mode: 'insensitive',
          },
        })),
      },
      take: limit,
      select: {
        id: true,
        text: true,
        type: true,
        category: true,
        creator: {
          select: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return questions;
  }

  /**
   * Estatísticas de questões
   */
  async getStatistics() {
    const [total, byType, byCategory, byOrigin] = await Promise.all([
      this.prisma.question.count(),
      this.prisma.question.groupBy({
        by: ['type'],
        _count: true,
      }),
      this.prisma.question.groupBy({
        by: ['category'],
        _count: true,
      }),
      this.prisma.question.groupBy({
        by: ['origin'],
        _count: true,
      }),
    ]);

    return {
      total,
      byType,
      byCategory,
      byOrigin,
    };
  }
}
