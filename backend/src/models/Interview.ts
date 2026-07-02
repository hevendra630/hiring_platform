import { Schema, model, Document, Types } from 'mongoose';

export type InterviewType = 'ai' | 'coding' | 'combined';
export type InterviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'expired' | 'cancelled';

export interface IInterviewTurn {
  question: Types.ObjectId; // ref Question
  candidateAnswer: string;
  /** Adaptive engine note: which previous-turn signal influenced this question being asked */
  adaptiveReason?: string;
  score: number; // 0-10
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  answeredAt?: Date;
}

export interface IInterview extends Document {
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  company: Types.ObjectId;
  type: InterviewType;
  status: InterviewStatus;
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  durationMinutes: number;
  turns: IInterviewTurn[];
  codingSubmissions: Types.ObjectId[]; // ref Submission
  overallScore?: number; // 0-100
  overallFeedback?: {
    summary: string;
    strengths: string[];
    weaknesses: string[];
    recommendation: 'strong_hire' | 'hire' | 'leaning_no' | 'no_hire';
  };
  /** Full transcript + reasoning trail powering the "AI interview replay" differentiator */
  transcriptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const interviewTurnSchema = new Schema<IInterviewTurn>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    candidateAnswer: { type: String, default: '' },
    adaptiveReason: { type: String },
    score: { type: Number, default: 0 },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    improvementSuggestions: [{ type: String }],
    answeredAt: { type: Date },
  },
  { _id: false },
);

const interviewSchema = new Schema<IInterview>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    type: { type: String, enum: ['ai', 'coding', 'combined'], default: 'combined' },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'expired', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
    scheduledAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
    durationMinutes: { type: Number, default: 30 },
    turns: [interviewTurnSchema],
    codingSubmissions: [{ type: Schema.Types.ObjectId, ref: 'Submission' }],
    overallScore: { type: Number },
    overallFeedback: {
      summary: String,
      strengths: [String],
      weaknesses: [String],
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'leaning_no', 'no_hire'],
      },
    },
    transcriptUrl: { type: String },
  },
  { timestamps: true },
);

export const Interview = model<IInterview>('Interview', interviewSchema);
