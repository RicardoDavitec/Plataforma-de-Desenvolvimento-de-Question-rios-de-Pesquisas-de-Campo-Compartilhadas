import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Subgroup } from '../../subgroups/entities/subgroup.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';

@Entity('field_researches')
export class FieldResearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  location: string; // Local da pesquisa

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'nvarchar', length: 50, default: 'planning' })
  status: string; // planning, in_progress, data_collection, analysis, completed

  @Column({ type: 'int', nullable: true })
  targetSampleSize: number; // Tamanho da amostra desejado

  @Column({ type: 'int', default: 0 })
  currentSampleSize: number; // Respostas coletadas

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  methodology: string;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  expectedResults: string;

  @Column({ type: 'text', nullable: true })
  ethicsCommitteeApproval: string; // Número do parecer do comitê de ética

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'uniqueidentifier' })
  subgroupId: string;

  @ManyToOne(() => Subgroup, (subgroup) => subgroup.fieldResearches)
  @JoinColumn({ name: 'subgroupId' })
  subgroup: Subgroup;

  @Column({ type: 'uniqueidentifier' })
  responsibleResearcherId: string;

  @ManyToOne(() => Researcher)
  @JoinColumn({ name: 'responsibleResearcherId' })
  responsibleResearcher: Researcher;

  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.fieldResearch)
  questionnaires: Questionnaire[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
