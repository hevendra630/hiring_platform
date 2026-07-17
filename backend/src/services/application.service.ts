import { applicationRepository, CreateApplicationInput } from '@repositories/application.repository';
import { jobRepository } from '@repositories/job.repository';
import { IApplication, ApplicationStatus } from '@models/Application';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import { Job } from '@models/Job';

export class ApplicationService {
  async applyToJob(input: CreateApplicationInput): Promise<IApplication> {
    const job = await jobRepository.findById(input.job);
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    if (job.status !== 'published') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot apply to this job as it is not published');
    }

    const existing = await applicationRepository.checkExisting(input.job, input.candidate);
    if (existing) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'You have already applied to this job');
    }

    const application = await applicationRepository.create(input);
    
    // Increment applicants count
    await Job.findByIdAndUpdate(job._id, { $inc: { applicantsCount: 1 } });

    return application;
  }

  async getApplicationById(applicationId: string): Promise<IApplication> {
    if (!Types.ObjectId.isValid(applicationId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid application ID');
    }

    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Application not found');
    }

    return application;
  }

  async getCandidateApplications(candidateId: string): Promise<IApplication[]> {
    return applicationRepository.findByCandidateId(candidateId);
  }

  async getJobApplications(jobId: string, recruiterId: string): Promise<IApplication[]> {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
    }

    if (job.createdBy.toString() !== recruiterId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to view applications for this job');
    }

    return applicationRepository.findByJobId(jobId);
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    recruiterId: string
  ): Promise<IApplication> {
    const application = await this.getApplicationById(applicationId);
    
    // Check recruiter permission via the job
    const job = await jobRepository.findById(application.job._id || application.job);
    if (!job || job.createdBy.toString() !== recruiterId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to update this application');
    }

    const updated = await applicationRepository.updateStatus(applicationId, status);
    if (!updated) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Application not found during update');
    }

    return updated;
  }
}

export const applicationService = new ApplicationService();
