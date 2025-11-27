import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Researcher } from '../../researchers/entities/researcher.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 50, unique: true })
  name: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Researcher, (researcher) => researcher.roleEntity)
  researchers: Researcher[];
}
