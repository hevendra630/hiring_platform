import { Schema, model, Document, Types } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  size?: string;
  description?: string;
  owner: Types.ObjectId; // recruiter who created it
  members: Types.ObjectId[]; // additional recruiters
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    logoUrl: { type: String },
    website: { type: String },
    industry: { type: String },
    size: { type: String },
    description: { type: String, maxlength: 2000 },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

export const Company = model<ICompany>('Company', companySchema);
