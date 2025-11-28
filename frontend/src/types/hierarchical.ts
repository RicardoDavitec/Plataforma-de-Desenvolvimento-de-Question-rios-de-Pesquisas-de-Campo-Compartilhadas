export interface Institution {
  id: string;
  name: string;
  acronym?: string;
  type: string;
  cnpj: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  rector?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projects?: ResearchProject[];
}

export interface ResearchProject {
  id: string;
  name: string;
  code?: string;
  codeUUID: string;
  description?: string;
  area?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  budget?: number;
  fundingAgency?: string;
  objectives?: string;
  expectedResults?: string;
  isActive: boolean;
  institutionId: string;
  institution?: Institution;
  responsibleResearcherId: string;
  responsibleResearcher?: any;
  subgroups?: Subgroup[];
  createdAt: string;
  updatedAt: string;
}

export interface Subgroup {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  researchProjectId?: string;
  researchProject?: ResearchProject;
  fieldResearches?: FieldResearch[];
  createdAt: string;
  updatedAt: string;
}

export interface FieldResearch {
  id: string;
  name: string;
  code?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  targetSampleSize?: number;
  currentSampleSize: number;
  methodology?: string;
  objectives?: string;
  expectedResults?: string;
  ethicsCommitteeApproval?: string;
  isActive: boolean;
  subgroupId: string;
  subgroup?: Subgroup;
  responsibleResearcherId: string;
  responsibleResearcher?: any;
  questionnaires?: Questionnaire[];
  createdAt: string;
  updatedAt: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description?: string;
  isActive: boolean;
  creatorId: string;
  subgroupId: string;
  fieldResearchId?: string;
  fieldResearch?: FieldResearch;
  questionSequences?: QuestionSequence[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionSequence {
  id: string;
  questionnaireId: string;
  questionId: string;
  question?: Question;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  conditionalLogic?: string;
  helpText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: string;
  subgroupId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
