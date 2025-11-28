import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ResearchProject } from '../../research-projects/entities/research-project.entity';

@Entity('institutions')
export class Institution {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  name: string;

  @Column({ type: 'nvarchar', length: 50, nullable: true })
  acronym: string;

  @Column({ type: 'nvarchar', length: 100 })
  type: string; // Universidade, Instituto de Pesquisa, etc.

  @Column({ type: 'nvarchar', length: 20, unique: true })
  cnpj: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  address: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'nvarchar', length: 2, nullable: true })
  state: string;

  @Column({ type: 'nvarchar', length: 10, nullable: true })
  zipCode: string;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  email: string;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  website: string;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  rector: string; // Reitor/Diretor

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @OneToMany(() => ResearchProject, (project) => project.institution)
  projects: ResearchProject[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
