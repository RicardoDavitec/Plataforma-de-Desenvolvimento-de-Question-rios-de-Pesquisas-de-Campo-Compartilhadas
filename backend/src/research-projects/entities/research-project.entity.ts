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
import { Institution } from '../../institutions/entities/institution.entity';
import { Researcher } from '../../researchers/entities/researcher.entity';
import { Subgroup } from '../../subgroups/entities/subgroup.entity';

@Entity('research_projects')
export class ResearchProject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  code: string;

  @Column({ 
    type: 'uniqueidentifier', 
    unique: true,
    nullable: false
  })
  codeUUID: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  area: string; // Área de conhecimento

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'nvarchar', length: 50, default: 'active' })
  status: string; // active, completed, suspended, cancelled

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  budget: number;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  fundingAgency: string; // Agência financiadora

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'text', nullable: true })
  expectedResults: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'uniqueidentifier' })
  institutionId: string;

  @ManyToOne(() => Institution, (institution) => institution.projects)
  @JoinColumn({ name: 'institutionId' })
  institution: Institution;

  @Column({ type: 'uniqueidentifier' })
  responsibleResearcherId: string;

  @ManyToOne(() => Researcher)
  @JoinColumn({ name: 'responsibleResearcherId' })
  responsibleResearcher: Researcher;

  @OneToMany(() => Subgroup, (subgroup) => subgroup.researchProject)
  subgroups: Subgroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
