import { Schema, model, Document, Types } from 'mongoose';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type SupportedLanguage = 'cpp' | 'java' | 'python' | 'javascript';

export interface ITestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number; // contribution to final score
}

export interface ICodingProblem extends Document {
  title: string;
  slug: string;
  description: string; // markdown
  difficulty: Difficulty;
  tags: string[];
  constraints: string[];
  sampleTestCases: ITestCase[];
  hiddenTestCases: ITestCase[];
  starterCode: Partial<Record<SupportedLanguage, string>>;
  timeLimitMs: number;
  memoryLimitMb: number;
  createdBy: Types.ObjectId;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseSchema = new Schema<ITestCase>(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    weight: { type: Number, default: 1 },
  },
  { _id: false },
);

const codingProblemSchema = new Schema<ICodingProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    tags: [{ type: String, index: true }],
    constraints: [{ type: String }],
    sampleTestCases: [testCaseSchema],
    hiddenTestCases: [testCaseSchema],
    starterCode: {
      cpp: String,
      java: String,
      python: String,
      javascript: String,
    },
    timeLimitMs: { type: Number, default: 2000 },
    memoryLimitMb: { type: Number, default: 256 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const CodingProblem = model<ICodingProblem>('CodingProblem', codingProblemSchema);
