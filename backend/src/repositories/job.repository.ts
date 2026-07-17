import { Job, IJob, JobStatus, EmploymentType } from '@models/Job';
import { Types } from 'mongoose';

export interface CreateJobInput {
  title: string;
  companyName: string;
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  description: string;
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  experienceMin?: number;
  experienceMax?: number;
  employmentType?: EmploymentType;
  location?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  status?: JobStatus;
  aiInterviewConfig?: {
    enabled: boolean;
    technicalQuestionCount: number;
    behavioralQuestionCount: number;
    durationMinutes: number;
  };
}

export class JobRepository {
  async create(input: CreateJobInput): Promise<IJob> {
    return Job.create(input);
  }

  async findById(id: string | Types.ObjectId): Promise<IJob | null> {
    return Job.findById(id).populate('company', 'name logoUrl');
  }

  async findByCompanyId(companyId: string | Types.ObjectId): Promise<IJob[]> {
    return Job.find({ company: companyId }).sort({ createdAt: -1 });
  }

  async findByRecruiterId(recruiterId: string | Types.ObjectId): Promise<IJob[]> {
    return Job.find({ createdBy: recruiterId }).sort({ createdAt: -1 });
  }

  async findAllPublished(): Promise<IJob[]> {
    return Job.find({ status: 'published' })
      .populate('company', 'name logoUrl')
      .sort({ createdAt: -1 });
  }

  async updateById(id: string | Types.ObjectId, update: Partial<IJob>): Promise<IJob | null> {
    return Job.findByIdAndUpdate(id, update, { new: true });
  }

  async deleteById(id: string | Types.ObjectId): Promise<IJob | null> {
    return Job.findByIdAndDelete(id);
  }
}

export const jobRepository = new JobRepository();
