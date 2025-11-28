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
import { FieldResearchesService } from './field-researches.service';
import { CreateFieldResearchDto } from './dto/create-field-research.dto';
import { UpdateFieldResearchDto } from './dto/update-field-research.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('field-researches')
@UseGuards(JwtAuthGuard)
export class FieldResearchesController {
  constructor(private readonly fieldResearchesService: FieldResearchesService) {}

  @Post()
  create(@Body() createFieldResearchDto: CreateFieldResearchDto) {
    return this.fieldResearchesService.create(createFieldResearchDto);
  }

  @Get()
  findAll(@Query('subgroupId') subgroupId?: string) {
    if (subgroupId) {
      return this.fieldResearchesService.findBySubgroup(subgroupId);
    }
    return this.fieldResearchesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fieldResearchesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFieldResearchDto: UpdateFieldResearchDto) {
    return this.fieldResearchesService.update(id, updateFieldResearchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fieldResearchesService.remove(id);
  }
}
