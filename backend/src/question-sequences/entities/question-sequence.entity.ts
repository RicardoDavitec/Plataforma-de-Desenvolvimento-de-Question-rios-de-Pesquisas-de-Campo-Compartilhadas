import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Questionnaire } from '../../questionnaires/entities/questionnaire.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('question_sequences')
export class QuestionSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  questionnaireId: string;

  @ManyToOne(() => Questionnaire, (questionnaire) => questionnaire.questionSequences)
  @JoinColumn({ name: 'questionnaireId' })
  questionnaire: Questionnaire;

  @Column({ type: 'uniqueidentifier' })
  questionId: string;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'questionId' })
  question: Question;

  @Column({ type: 'int' })
  order: number; // Ordem da questão no questionário

  @Column({ type: 'bit', default: true })
  isRequired: boolean; // Se a questão é obrigatória

  @Column({ type: 'bit', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  conditionalLogic: string; // JSON com lógica condicional (pular questões, etc)

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  helpText: string; // Texto de ajuda específico para esta aplicação da questão

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
