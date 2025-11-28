import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResearchProjectsService } from './research-projects.service';
import { ResearchProjectsController } from './research-projects.controller';
import { ResearchProject } from './entities/research-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResearchProject])],
  controllers: [ResearchProjectsController],
  providers: [ResearchProjectsService],
  exports: [ResearchProjectsService],
})
export class ResearchProjectsModule {}
