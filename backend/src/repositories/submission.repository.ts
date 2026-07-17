import { Submission, ISubmission, ITestCaseResult, SubmissionStatus } from '@models/Submission';

export interface CreateSubmissionInput {
  candidate: string;
  problem: string;
  interview?: string;
  language: string;
  sourceCode: string;
  isFinalSubmission: boolean;
  status: SubmissionStatus;
  score: number;
  testCaseResults: ITestCaseResult[];
  executionTimeMs?: number;
}

export class SubmissionRepository {
  async create(input: CreateSubmissionInput): Promise<ISubmission> {
    return Submission.create(input);
  }

  async findById(id: string): Promise<ISubmission | null> {
    return Submission.findById(id).populate('problem');
  }

  async findByCandidateAndProblem(candidateId: string, problemId: string): Promise<ISubmission[]> {
    return Submission.find({ candidate: candidateId, problem: problemId }).sort({ createdAt: -1 });
  }

  async updateStatus(id: string, status: SubmissionStatus, score: number, testCaseResults: ITestCaseResult[]): Promise<ISubmission | null> {
    return Submission.findByIdAndUpdate(id, { status, score, testCaseResults }, { new: true });
  }
}

export const submissionRepository = new SubmissionRepository();
