import { Schema, model, Document, Types } from 'mongoose';

export type QuestionCategory = 'technical' | 'behavioral' | 'follow_up';

export interface IQuestion extends Document {
  text: string;
  category: QuestionCategory;
  job?: Types.ObjectId;
  generatedFrom: {
    resume: boolean;
    jobDescription: boolean;
    candidateExperience: boolean;
    previousAnswer: boolean; // true for adaptive follow-up questions
  };
  parentQuestion?: Types.ObjectId; // for follow-ups, points to the question that triggered it
  expectedTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    category: { type: String, enum: ['technical', 'behavioral', 'follow_up'], required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    generatedFrom: {
      resume: { type: Boolean, default: false },
      jobDescription: { type: Boolean, default: false },
      candidateExperience: { type: Boolean, default: false },
      previousAnswer: { type: Boolean, default: false },
    },
    parentQuestion: { type: Schema.Types.ObjectId, ref: 'Question' },
    expectedTopics: [{ type: String }],
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  { timestamps: true },
);

export const Question = model<IQuestion>('Question', questionSchema);
