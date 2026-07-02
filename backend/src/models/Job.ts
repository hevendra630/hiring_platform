import { Schema, model, Document, Types } from 'mongoose';

export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';
export type EmploymentType = 'full-time' | 'part-time' | 'internship' | 'contract';

export interface IJob extends Document {
  title: string;
  company: Types.ObjectId;
  createdBy: Types.ObjectId;
  description: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  experienceMin: number;
  experienceMax: number;
  employmentType: EmploymentType;
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  status: JobStatus;
  codingRoundIds: Types.ObjectId[]; // CodingProblem refs used for this job's coding round
  aiInterviewConfig: {
    enabled: boolean;
    technicalQuestionCount: number;
    behavioralQuestionCount: number;
    durationMinutes: number;
  };
  applicantsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    requiredSkills: [{ type: String }],
    niceToHaveSkills: [{ type: String }],
    experienceMin: { type: Number, default: 0 },
    experienceMax: { type: Number, default: 0 },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'internship', 'contract'],
      default: 'full-time',
    },
    location: { type: String, default: 'Remote' },
    isRemote: { type: Boolean, default: true },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    status: { type: String, enum: ['draft', 'published', 'closed', 'archived'], default: 'draft', index: true },
    codingRoundIds: [{ type: Schema.Types.ObjectId, ref: 'CodingProblem' }],
    aiInterviewConfig: {
      enabled: { type: Boolean, default: true },
      technicalQuestionCount: { type: Number, default: 5 },
      behavioralQuestionCount: { type: Number, default: 2 },
      durationMinutes: { type: Number, default: 30 },
    },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

jobSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });

export const Job = model<IJob>('Job', jobSchema);
