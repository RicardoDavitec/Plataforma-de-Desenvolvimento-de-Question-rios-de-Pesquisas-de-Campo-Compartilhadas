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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/add-project-member.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, ProjectStatus } from '@prisma/client';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @ApiOperation({ summary: 'Criar novo projeto' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 403, description: 'Acesso negado - role insuficiente' })
  async create(
    @CurrentUser('userId') userId: string,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os projetos' })
  @ApiQuery({ name: 'status', enum: ProjectStatus, required: false })
  @ApiQuery({ name: 'institutionId', required: false })
  @ApiQuery({ name: 'researchArea', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por título, descrição ou palavras-chave' })
  @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso' })
  async findAll(
    @Query('status') status?: ProjectStatus,
    @Query('institutionId') institutionId?: string,
    @Query('researchArea') researchArea?: string,
    @Query('search') search?: string,
  ) {
    return this.projectsService.findAll({ status, institutionId, researchArea, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto encontrado' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @ApiOperation({ summary: 'Atualizar projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto, userId);
  }

  @Delete(':id')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deletar projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Projeto deletado com sucesso' })
  @ApiResponse({ status: 400, description: 'Projeto possui dependências' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  @ApiResponse({ status: 403, description: 'Acesso negado' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.projectsService.remove(id, userId);
  }

  // ===== GERENCIAMENTO DE COORDENADORES =====

  @Post(':id/coordinators/:researcherId')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar coordenador ao projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiParam({ name: 'researcherId', description: 'ID do pesquisador' })
  @ApiResponse({ status: 201, description: 'Coordenador adicionado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pesquisador já é coordenador' })
  @ApiResponse({ status: 404, description: 'Projeto ou pesquisador não encontrado' })
  async addCoordinator(
    @Param('id') id: string,
    @Param('researcherId') researcherId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.projectsService.addCoordinator(id, researcherId, userId);
  }

  @Delete(':id/coordinators/:researcherId')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover coordenador do projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiParam({ name: 'researcherId', description: 'ID do pesquisador' })
  @ApiResponse({ status: 200, description: 'Coordenador removido com sucesso' })
  @ApiResponse({ status: 400, description: 'Não é possível remover o único coordenador' })
  @ApiResponse({ status: 404, description: 'Coordenador não encontrado' })
  async removeCoordinator(
    @Param('id') id: string,
    @Param('researcherId') researcherId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.projectsService.removeCoordinator(id, researcherId, userId);
  }

  // ===== GERENCIAMENTO DE MEMBROS =====

  @Post(':id/members')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Adicionar membro ao projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 201, description: 'Membro adicionado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pesquisador já é membro' })
  @ApiResponse({ status: 404, description: 'Projeto ou pesquisador não encontrado' })
  async addMember(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() addMemberDto: AddProjectMemberDto,
  ) {
    return this.projectsService.addMember(id, addMemberDto, userId);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Listar membros do projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Lista de membros retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async getMembers(@Param('id') id: string) {
    return this.projectsService.getMembers(id);
  }

  @Delete(':id/members/:researcherId')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover membro do projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiParam({ name: 'researcherId', description: 'ID do pesquisador' })
  @ApiResponse({ status: 200, description: 'Membro removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado' })
  async removeMember(
    @Param('id') id: string,
    @Param('researcherId') researcherId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.projectsService.removeMember(id, researcherId, userId);
  }

  // ===== ESTATÍSTICAS =====

  @Get(':id/statistics')
  @Roles(
    UserRole.COORDENADOR_PROJETO,
    UserRole.COORDENADOR_GRUPO,
    UserRole.DOCENTE,
    UserRole.ORIENTADOR
  )
  @ApiOperation({ summary: 'Obter estatísticas do projeto' })
  @ApiParam({ name: 'id', description: 'ID do projeto' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async getStatistics(@Param('id') id: string) {
    return this.projectsService.getStatistics(id);
  }
}
