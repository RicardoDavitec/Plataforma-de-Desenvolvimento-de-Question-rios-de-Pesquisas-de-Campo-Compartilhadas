import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SubgroupsService } from './subgroups.service';
import { CreateSubgroupDto } from './dto/create-subgroup.dto';
import { UpdateSubgroupDto } from './dto/update-subgroup.dto';

@ApiTags('subgroups')
@Controller('subgroups')
export class SubgroupsController {
  constructor(private readonly subgroupsService: SubgroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo subgrupo de pesquisa' })
  @ApiResponse({ status: 201, description: 'Subgrupo criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() createSubgroupDto: CreateSubgroupDto) {
    return this.subgroupsService.create(createSubgroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os subgrupos' })
  @ApiQuery({ name: 'researchProjectId', required: false, description: 'Filtrar por projeto de pesquisa' })
  @ApiResponse({ status: 200, description: 'Lista de subgrupos retornada com sucesso' })
  findAll(@Query('researchProjectId') researchProjectId?: string) {
    if (researchProjectId) {
      return this.subgroupsService.findByProject(researchProjectId);
    }
    return this.subgroupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar subgrupo por ID' })
  @ApiResponse({ status: 200, description: 'Subgrupo encontrado' })
  @ApiResponse({ status: 404, description: 'Subgrupo não encontrado' })
  findOne(@Param('id') id: string) {
    return this.subgroupsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar subgrupo' })
  @ApiResponse({ status: 200, description: 'Subgrupo atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Subgrupo não encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateSubgroupDto: UpdateSubgroupDto,
  ) {
    return this.subgroupsService.update(id, updateSubgroupDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover subgrupo' })
  @ApiResponse({ status: 200, description: 'Subgrupo removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Subgrupo não encontrado' })
  remove(@Param('id') id: string) {
    return this.subgroupsService.remove(id);
  }
}
