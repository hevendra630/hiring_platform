import { Application, IApplication, ApplicationStatus } from '@models/Application';
import { Types } from 'mongoose';

export interface CreateApplicationInput {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  resume: Types.ObjectId;
}

export class ApplicationRepository {
  async create(input: CreateApplicationInput): Promise<IApplication> {
    return Application.create(input);
  }

  async findById(id: string | Types.ObjectId): Promise<IApplication | null> {
    return Application.findById(id)
      .populate('job')
      .populate('candidate', 'name email avatarUrl')
      .populate('resume');
  }

  async findByCandidateId(candidateId: string | Types.ObjectId): Promise<IApplication[]> {
    return Application.find({ candidate: candidateId })
      .populate('job')
      .sort({ appliedAt: -1 });
  }

  async findByJobId(jobId: string | Types.ObjectId): Promise<IApplication[]> {
    return Application.find({ job: jobId })
      .populate('candidate', 'name email avatarUrl')
      .populate('resume')
      .sort({ appliedAt: -1 });
  }

  async checkExisting(jobId: string | Types.ObjectId, candidateId: string | Types.ObjectId): Promise<IApplication | null> {
    return Application.findOne({ job: jobId, candidate: candidateId });
  }

  async updateStatus(id: string | Types.ObjectId, status: ApplicationStatus): Promise<IApplication | null> {
    return Application.findByIdAndUpdate(id, { status }, { new: true });
  }
}

export const applicationRepository = new ApplicationRepository();
