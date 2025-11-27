import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { SubgroupsModule } from './subgroups/subgroups.module';
import { ResearchersModule } from './researchers/researchers.module';
import { QuestionsModule } from './questions/questions.module';
import { QuestionnairesModule } from './questionnaires/questionnaires.module';
import { SurveysModule } from './surveys/surveys.module';
import { SimilarityModule } from './similarity/similarity.module';
import { RolesModule } from './roles/roles.module';
import { RolesService } from './roles/roles.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    RolesModule,
    SubgroupsModule,
    ResearchersModule,
    QuestionsModule,
    QuestionnairesModule,
    SurveysModule,
    SimilarityModule,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private rolesService: RolesService) {}

  async onModuleInit() {
    // Seed initial roles
    await this.rolesService.seedRoles();
  }
}
