import { Resume, IResume, IResumeAnalysis } from '@models/Resume';
import { Types } from 'mongoose';

export interface CreateResumeInput {
  candidate: Types.ObjectId | string;
  fileUrl: string;
  cloudinaryPublicId: string;
  originalFileName: string;
  analysis?: IResumeAnalysis;
}

export class ResumeRepository {
  async create(input: CreateResumeInput): Promise<IResume> {
    // If we're creating a new one, we might want to deactivate old ones
    await Resume.updateMany(
      { candidate: input.candidate, isActive: true },
      { $set: { isActive: false } }
    );
    return Resume.create(input);
  }

  async findByCandidateId(candidateId: string | Types.ObjectId): Promise<IResume | null> {
    return Resume.findOne({ candidate: candidateId, isActive: true });
  }

  async updateById(id: string | Types.ObjectId, update: Partial<IResume>): Promise<IResume | null> {
    return Resume.findByIdAndUpdate(id, update, { new: true });
  }

  async updateAnalysis(id: string | Types.ObjectId, analysis: Partial<IResumeAnalysis>): Promise<IResume | null> {
    // Since analysis is a nested object, we can just update the fields provided
    const updateObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(analysis)) {
      updateObj[`analysis.${key}`] = value;
    }
    
    return Resume.findByIdAndUpdate(id, { $set: updateObj }, { new: true });
  }
}

export const resumeRepository = new ResumeRepository();
