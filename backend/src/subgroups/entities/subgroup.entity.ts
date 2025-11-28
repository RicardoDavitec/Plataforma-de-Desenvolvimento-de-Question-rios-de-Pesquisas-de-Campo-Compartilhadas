import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Question } from '../../questions/entities/question.entity';
import { ResearchProject } from '../../research-projects/entities/research-project.entity';
import { FieldResearch } from '../../field-researches/entities/field-research.entity';

@Entity('subgroups')
export class Subgroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'uniqueidentifier', nullable: true })
  researchProjectId: string;

  @ManyToOne(() => ResearchProject, (project) => project.subgroups)
  @JoinColumn({ name: 'researchProjectId' })
  researchProject: ResearchProject;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Researcher, (researcher) => researcher.subgroup)
  researchers: Researcher[];

  @OneToMany(() => Question, (question) => question.subgroup)
  questions: Question[];

  @OneToMany(() => FieldResearch, (fieldResearch) => fieldResearch.subgroup)
  fieldResearches: FieldResearch[];
}
