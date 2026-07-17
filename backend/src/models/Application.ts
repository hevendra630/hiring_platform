import { Schema, model, Document, Types } from 'mongoose';

export type ApplicationStatus = 'applied' | 'reviewing' | 'shortlisted' | 'interviewing' | 'offered' | 'rejected';

export interface IApplication extends Document {
  job: Types.ObjectId;
  candidate: Types.ObjectId;
  resume: Types.ObjectId;
  status: ApplicationStatus;
  appliedAt: Date;
  updatedAt: Date;
  notes?: string;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'shortlisted', 'interviewing', 'offered', 'rejected'],
      default: 'applied',
      index: true,
    },
    notes: { type: String },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Ensure a candidate can only apply once to a specific job
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

export const Application = model<IApplication>('Application', applicationSchema);
