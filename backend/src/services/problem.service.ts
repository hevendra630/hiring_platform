import { problemRepository, CreateProblemInput } from '@repositories/problem.repository';
import { ICodingProblem } from '@models/CodingProblem';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

export class ProblemService {
  async createProblem(input: CreateProblemInput): Promise<ICodingProblem> {
    const existing = await problemRepository.findBySlug(input.slug);
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, 'A problem with this slug already exists');
    }
    return problemRepository.create(input);
  }

  async getProblemById(problemId: string): Promise<ICodingProblem> {
    if (!Types.ObjectId.isValid(problemId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid problem ID');
    }

    const problem = await problemRepository.findById(problemId);
    if (!problem) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Problem not found');
    }

    return problem;
  }

  async getAllPublishedProblems(): Promise<ICodingProblem[]> {
    return problemRepository.findAllPublished();
  }
}

export const problemService = new ProblemService();
