import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldResearchesService } from './field-researches.service';
import { FieldResearchesController } from './field-researches.controller';
import { FieldResearch } from './entities/field-research.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldResearch])],
  controllers: [FieldResearchesController],
  providers: [FieldResearchesService],
  exports: [FieldResearchesService],
})
export class FieldResearchesModule {}
