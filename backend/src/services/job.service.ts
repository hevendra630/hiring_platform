import { jobRepository, CreateJobInput } from '@repositories/job.repository';
import { IJob } from '@models/Job';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

export class JobService {
  async createJob(input: CreateJobInput): Promise<IJob> {
    return jobRepository.create(input);
  }

  async getJobById(jobId: string): Promise<IJob> {
    if (!Types.ObjectId.isValid(jobId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid job ID');
    }

    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    return job;
  }

  async getJobsByCompany(companyId: string): Promise<IJob[]> {
    if (!companyId) return [];
    return jobRepository.findByCompanyId(companyId);
  }

  async getJobsByRecruiter(recruiterId: string): Promise<IJob[]> {
    if (!recruiterId) return [];
    return jobRepository.findByRecruiterId(recruiterId);
  }

  async getAllPublishedJobs(): Promise<IJob[]> {
    return jobRepository.findAllPublished();
  }

  async updateJob(jobId: string, recruiterId: string, update: Partial<IJob>): Promise<IJob> {
    const job = await this.getJobById(jobId);

    // Verify ownership
    if (job.createdBy.toString() !== recruiterId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this job');
    }

    const updatedJob = await jobRepository.updateById(jobId, update);
    if (!updatedJob) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found during update');
    }

    return updatedJob;
  }

  async deleteJob(jobId: string, recruiterId: string): Promise<void> {
    const job = await this.getJobById(jobId);

    // Verify ownership
    if (job.createdBy.toString() !== recruiterId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to delete this job');
    }

    await jobRepository.deleteById(jobId);
  }
}

export const jobService = new JobService();
