import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ImportQuestionsDto } from './dto/import-questions.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Questions')
@Controller('questions')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Post()
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Criar nova questão' })
  @ApiResponse({ status: 201, description: 'Questão criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    // Buscar o researcher ID do usuário
    return this.questionsService.create(userId, createQuestionDto);
  }

  @Post('import')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Importar múltiplas questões de uma vez' })
  @ApiResponse({ status: 201, description: 'Importação concluída (pode conter falhas parciais)' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async importQuestions(
    @CurrentUser('userId') userId: string,
    @Body() importDto: ImportQuestionsDto,
  ) {
    return this.questionsService.importQuestions(userId, importDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as questões com filtros opcionais' })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo' })
  @ApiQuery({ name: 'category', required: false, description: 'Filtrar por categoria' })
  @ApiQuery({ name: 'scope', required: false, description: 'Filtrar por escopo' })
  @ApiQuery({ name: 'origin', required: false, description: 'Filtrar por origem' })
  @ApiQuery({ name: 'creatorId', required: false, description: 'Filtrar por criador' })
  @ApiQuery({ name: 'researchGroupId', required: false, description: 'Filtrar por grupo de pesquisa' })
  @ApiResponse({ status: 200, description: 'Lista de questões retornada com sucesso' })
  async findAll(
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('scope') scope?: string,
    @Query('origin') origin?: string,
    @Query('creatorId') creatorId?: string,
    @Query('researchGroupId') researchGroupId?: string,
  ) {
    return this.questionsService.findAll({
      type,
      category,
      scope,
      origin,
      creatorId,
      researchGroupId,
    });
  }

  @Get('statistics')
  @Roles(UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Obter estatísticas de questões (apenas coordenadores e docentes)' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async getStatistics() {
    return this.questionsService.getStatistics();
  }

  @Get('similar')
  @ApiOperation({ summary: 'Buscar questões similares por texto' })
  @ApiQuery({ name: 'text', required: true, description: 'Texto para busca de similaridade' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de resultados', type: Number })
  @ApiResponse({ status: 200, description: 'Questões similares encontradas' })
  async findSimilar(
    @Query('text') text: string,
    @Query('limit') limit?: number,
  ) {
    return this.questionsService.findSimilar(text, limit ? parseInt(limit.toString()) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar questão por ID' })
  @ApiResponse({ status: 200, description: 'Questão encontrada' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.questionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @ApiOperation({ summary: 'Atualizar questão (cria nova versão)' })
  @ApiResponse({ status: 200, description: 'Nova versão da questão criada' })
  @ApiResponse({ status: 400, description: 'Apenas o criador pode atualizar' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.questionsService.update(id, userId, updateQuestionDto);
  }

  @Delete(':id')
  @Roles(UserRole.PESQUISADOR, UserRole.COORDENADOR_PROJETO, UserRole.COORDENADOR_GRUPO, UserRole.DOCENTE)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover questão (apenas se não estiver em uso)' })
  @ApiResponse({ status: 200, description: 'Questão removida com sucesso' })
  @ApiResponse({ status: 400, description: 'Apenas o criador pode remover' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  @ApiResponse({ status: 404, description: 'Questão não encontrada' })
  @ApiResponse({ status: 409, description: 'Questão está em uso e não pode ser removida' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.questionsService.remove(id, userId);
  }
}
