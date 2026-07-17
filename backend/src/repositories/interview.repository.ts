import { Interview, IInterview } from '@models/Interview';
import { Types } from 'mongoose';

export interface CreateInterviewInput {
  candidate: Types.ObjectId | string;
  job: Types.ObjectId | string;
  company: Types.ObjectId | string;
  type?: 'ai' | 'coding' | 'combined';
  scheduledAt?: Date;
  durationMinutes?: number;
}

export class InterviewRepository {
  async create(input: CreateInterviewInput): Promise<IInterview> {
    return Interview.create({
      ...input,
      status: 'scheduled',
    });
  }

  async findById(id: string | Types.ObjectId): Promise<IInterview | null> {
    return Interview.findById(id).populate('job candidate company');
  }

  async findByCandidateId(candidateId: string | Types.ObjectId): Promise<IInterview[]> {
    return Interview.find({ candidate: candidateId })
      .populate('job', 'title')
      .populate('company', 'name')
      .sort({ createdAt: -1 });
  }

  async findByJobId(jobId: string | Types.ObjectId): Promise<IInterview[]> {
    return Interview.find({ job: jobId })
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });
  }

  async findByCompanyId(companyId: string | Types.ObjectId): Promise<IInterview[]> {
    return Interview.find({ company: companyId })
      .populate('job', 'title')
      .populate('candidate', 'name email')
      .sort({ createdAt: -1 });
  }

  async updateStatus(id: string | Types.ObjectId, status: IInterview['status']): Promise<IInterview | null> {
    const update: any = { status };
    if (status === 'in_progress') update.startedAt = new Date();
    if (status === 'completed') update.completedAt = new Date();
    return Interview.findByIdAndUpdate(id, { $set: update }, { new: true });
  }

  async updateById(id: string | Types.ObjectId, updateData: Partial<IInterview>): Promise<IInterview | null> {
    return Interview.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }
}

export const interviewRepository = new InterviewRepository();
