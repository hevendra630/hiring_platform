import { CodingProblem, ICodingProblem, ITestCase, SupportedLanguage } from '@models/CodingProblem';

export interface CreateProblemInput {
  title: string;
  slug: string;
  description: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  tags?: string[];
  constraints?: string[];
  sampleTestCases: ITestCase[];
  hiddenTestCases: ITestCase[];
  starterCode?: Partial<Record<SupportedLanguage, string>>;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  createdBy: string;
  isPublished?: boolean;
}

export class ProblemRepository {
  async create(input: CreateProblemInput): Promise<ICodingProblem> {
    return CodingProblem.create(input);
  }

  async findById(id: string): Promise<ICodingProblem | null> {
    return CodingProblem.findById(id);
  }

  async findAllPublished(): Promise<ICodingProblem[]> {
    return CodingProblem.find({ isPublished: true }).sort({ createdAt: -1 });
  }

  async findBySlug(slug: string): Promise<ICodingProblem | null> {
    return CodingProblem.findOne({ slug });
  }
}

export const problemRepository = new ProblemRepository();
