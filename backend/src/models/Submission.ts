import { Schema, model, Document, Types } from 'mongoose';
import { SupportedLanguage } from './CodingProblem';

export type SubmissionStatus =
  | 'pending'
  | 'running'
  | 'accepted'
  | 'wrong_answer'
  | 'time_limit_exceeded'
  | 'memory_limit_exceeded'
  | 'runtime_error'
  | 'compile_error';

export interface ITestCaseResult {
  passed: boolean;
  isHidden: boolean;
  runtimeMs: number;
  output?: string;
  expectedOutput?: string;
  errorMessage?: string;
}

export interface ISubmission extends Document {
  candidate: Types.ObjectId;
  problem: Types.ObjectId;
  interview?: Types.ObjectId; // when submitted as part of an interview's coding round
  language: SupportedLanguage;
  sourceCode: string;
  isFinalSubmission: boolean; // false = "Run" (sample only), true = "Submit" (full grading)
  status: SubmissionStatus;
  score: number; // 0-100, weighted by test case
  testCaseResults: ITestCaseResult[];
  executionTimeMs?: number;
  memoryUsedMb?: number;
  createdAt: Date;
  updatedAt: Date;
}

const testCaseResultSchema = new Schema<ITestCaseResult>(
  {
    passed: { type: Boolean, required: true },
    isHidden: { type: Boolean, default: false },
    runtimeMs: { type: Number, default: 0 },
    output: { type: String },
    expectedOutput: { type: String },
    errorMessage: { type: String },
  },
  { _id: false },
);

const submissionSchema = new Schema<ISubmission>(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    problem: { type: Schema.Types.ObjectId, ref: 'CodingProblem', required: true, index: true },
    interview: { type: Schema.Types.ObjectId, ref: 'Interview' },
    language: { type: String, enum: ['cpp', 'java', 'python', 'javascript'], required: true },
    sourceCode: { type: String, required: true },
    isFinalSubmission: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        'pending',
        'running',
        'accepted',
        'wrong_answer',
        'time_limit_exceeded',
        'memory_limit_exceeded',
        'runtime_error',
        'compile_error',
      ],
      default: 'pending',
      index: true,
    },
    score: { type: Number, default: 0 },
    testCaseResults: [testCaseResultSchema],
    executionTimeMs: { type: Number },
    memoryUsedMb: { type: Number },
  },
  { timestamps: true },
);

export const Submission = model<ISubmission>('Submission', submissionSchema);
