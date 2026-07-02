import { Schema, model, Document, Types } from 'mongoose';

export type ReportType = 'candidate_summary' | 'job_funnel' | 'candidate_comparison';
export type ReportFormat = 'pdf' | 'csv' | 'json';

export interface IReport extends Document {
  type: ReportType;
  generatedBy: Types.ObjectId;
  company: Types.ObjectId;
  job?: Types.ObjectId;
  candidates: Types.ObjectId[];
  format: ReportFormat;
  fileUrl?: string;
  payload?: Record<string, unknown>; // cached computed data for json/preview
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    type: {
      type: String,
      enum: ['candidate_summary', 'job_funnel', 'candidate_comparison'],
      required: true,
    },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job' },
    candidates: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    format: { type: String, enum: ['pdf', 'csv', 'json'], default: 'json' },
    fileUrl: { type: String },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const Report = model<IReport>('Report', reportSchema);
