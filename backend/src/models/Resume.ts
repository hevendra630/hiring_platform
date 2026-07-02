import { Schema, model, Document, Types } from 'mongoose';

export interface IResumeAnalysis {
  atsScore: number; // 0-100
  extractedSkills: string[];
  missingSkills: string[];
  suitableRoles: string[];
  improvementSuggestions: string[];
  education: { degree: string; institution: string; year?: string }[];
  experience: { title: string; company: string; durationMonths?: number; summary?: string }[];
  projects: { name: string; description: string; techStack: string[] }[];
  summary: string;
  analyzedAt: Date;
}

export interface IResume extends Document {
  candidate: Types.ObjectId;
  fileUrl: string; // Cloudinary URL
  cloudinaryPublicId: string;
  originalFileName: string;
  isActive: boolean; // only one active resume per candidate
  analysis?: IResumeAnalysis;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    originalFileName: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    analysis: {
      atsScore: { type: Number, min: 0, max: 100 },
      extractedSkills: [{ type: String }],
      missingSkills: [{ type: String }],
      suitableRoles: [{ type: String }],
      improvementSuggestions: [{ type: String }],
      education: [
        { degree: String, institution: String, year: String },
      ],
      experience: [
        { title: String, company: String, durationMonths: Number, summary: String },
      ],
      projects: [{ name: String, description: String, techStack: [String] }],
      summary: { type: String },
      analyzedAt: { type: Date },
    },
  },
  { timestamps: true },
);

export const Resume = model<IResume>('Resume', resumeSchema);
