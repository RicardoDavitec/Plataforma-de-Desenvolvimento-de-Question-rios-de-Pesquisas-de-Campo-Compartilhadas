export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subgroupId: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface Subgroup {
  id: string;
  name: string;
  description?: string;
  researchGroupId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Researcher {
  id: string;
  name: string;
  email: string;
  password?: string;
  subgroupId: string;
  phone?: string;
  institution?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'single_choice' | 'open_text' | 'yes_no' | 'quantitative' | 'qualitative' | 'scale';
  options?: string[];
  subgroupId: string;
  authorId?: string;
  objective?: string;
  targetAudience?: string;
  researchName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimilarQuestion {
  question: Question;
  similarity: number;
}

export interface QuestionMergeOption {
  value: 'keep' | 'accept' | 'merge' | 'concatenate' | 'replace';
  label: string;
}
