import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType =
  | 'interview_reminder'
  | 'interview_result'
  | 'recruiter_alert'
  | 'email_verification'
  | 'password_reset'
  | 'system';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'interview_reminder',
        'interview_result',
        'recruiter_alert',
        'email_verification',
        'password_reset',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

export const Notification = model<INotification>('Notification', notificationSchema);
