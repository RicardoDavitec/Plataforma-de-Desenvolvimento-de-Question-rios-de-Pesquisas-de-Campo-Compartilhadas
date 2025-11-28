import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Subgroup } from '../../subgroups/entities/subgroup.entity';
import { Question } from '../../questions/entities/question.entity';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';
import { Survey } from '../../surveys/entities/survey.entity';
import { Role } from '../../roles/entities/role.entity';

export enum ResearcherRole {
  ADMIN = 'admin',
  RESEARCHER = 'researcher',
  VIEWER = 'viewer',
}

@Entity('researchers')
export class Researcher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 150 })
  name: string;

  @Column({ type: 'nvarchar', length: 150, unique: true })
  email: string;

  @Column({ type: 'nvarchar', length: 255 })
  password: string;

  @Column({
    type: 'nvarchar',
    length: 20,
    enum: ResearcherRole,
    default: ResearcherRole.RESEARCHER,
  })
  role: ResearcherRole;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  institution: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  researchProjectId: string;

  @ManyToOne(() => Subgroup, (subgroup) => subgroup.researchers, { nullable: true })
  @JoinColumn({ name: 'subgroupId' })
  subgroup: Subgroup;

  @Column({ type: 'uniqueidentifier', nullable: true })
  subgroupId: string;

  @ManyToOne(() => Role, (role) => role.researchers, { nullable: true })
  @JoinColumn({ name: 'roleId' })
  roleEntity: Role;

  @Column({ type: 'uniqueidentifier', nullable: true })
  roleId: string;

  @OneToMany(() => Question, (question) => question.author)
  questions: Question[];

  @OneToMany(() => Questionnaire, (questionnaire) => questionnaire.creator)
  questionnaires: Questionnaire[];

  @OneToMany(() => Survey, (survey) => survey.responsible)
  surveys: Survey[];
}
