import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Institutions')
@ApiBearerAuth()
@Controller('institutions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @Roles('COORDENADOR_GRUPO', 'COORDENADOR_PROJETO', 'DOCENTE')
  @ApiOperation({ 
    summary: 'Criar nova instituição',
    description: 'Apenas coordenadores e docentes podem criar instituições' 
  })
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionsService.create(createInstitutionDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar todas as instituições',
    description: 'Retorna lista de instituições com filtros opcionais' 
  })
  @ApiQuery({ name: 'type', required: false, description: 'Filtrar por tipo de instituição' })
  @ApiQuery({ name: 'state', required: false, description: 'Filtrar por estado (UF)' })
  @ApiQuery({ name: 'city', required: false, description: 'Filtrar por cidade' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nome, CNPJ ou cidade' })
  findAll(
    @Query('type') type?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.institutionsService.findAll({ type, state, city, search });
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar instituição por ID',
    description: 'Retorna detalhes completos da instituição incluindo pesquisadores e projetos' 
  })
  findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Get(':id/researchers')
  @ApiOperation({ 
    summary: 'Listar pesquisadores da instituição',
    description: 'Retorna todos os pesquisadores vinculados à instituição' 
  })
  @ApiQuery({ 
    name: 'primary', 
    required: false, 
    type: Boolean,
    description: 'true para pesquisadores principais, false para secundários' 
  })
  getResearchers(
    @Param('id') id: string,
    @Query('primary') primary?: string,
  ) {
    const isPrimary = primary === undefined || primary === 'true';
    return this.institutionsService.getResearchers(id, isPrimary);
  }

  @Get(':id/statistics')
  @Roles('COORDENADOR_GRUPO', 'COORDENADOR_PROJETO', 'DOCENTE')
  @ApiOperation({ 
    summary: 'Obter estatísticas da instituição',
    description: 'Retorna contadores e estatísticas sobre pesquisadores e projetos' 
  })
  getStatistics(@Param('id') id: string) {
    return this.institutionsService.getStatistics(id);
  }

  @Patch(':id')
  @Roles('COORDENADOR_GRUPO', 'COORDENADOR_PROJETO', 'DOCENTE')
  @ApiOperation({ 
    summary: 'Atualizar instituição',
    description: 'Apenas coordenadores e docentes podem atualizar instituições' 
  })
  update(
    @Param('id') id: string,
    @Body() updateInstitutionDto: UpdateInstitutionDto,
  ) {
    return this.institutionsService.update(id, updateInstitutionDto);
  }

  @Delete(':id')
  @Roles('COORDENADOR_GRUPO', 'COORDENADOR_PROJETO', 'DOCENTE')
  @ApiOperation({ 
    summary: 'Remover instituição',
    description: 'Remove instituição se não houver dependências (pesquisadores ou projetos vinculados)' 
  })
  remove(@Param('id') id: string) {
    return this.institutionsService.remove(id);
  }
}
