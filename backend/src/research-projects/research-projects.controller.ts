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
} from '@nestjs/common';
import { ResearchProjectsService } from './research-projects.service';
import { CreateResearchProjectDto } from './dto/create-research-project.dto';
import { UpdateResearchProjectDto } from './dto/update-research-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('research-projects')
@UseGuards(JwtAuthGuard)
export class ResearchProjectsController {
  constructor(private readonly projectsService: ResearchProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateResearchProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@Query('institutionId') institutionId?: string) {
    if (institutionId) {
      return this.projectsService.findByInstitution(institutionId);
    }
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateResearchProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
