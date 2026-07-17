import nodemailer, { Transporter } from 'nodemailer';
import { env } from '@config/env';
import { logger } from '@utils/logger';

import { createEvent, EventAttributes } from 'ics';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: { filename: string; content: string }[];
}

/**
 * Thin wrapper around nodemailer. Controllers/services never call
 * nodemailer directly - they call EmailService.send(), which in a real
 * deployment is invoked from a BullMQ worker (see /jobs/email.job.ts)
 * so request latency never blocks on SMTP round-trips.
 */
class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
    });
  }

  async send({ to, subject, html, attachments }: SendEmailParams): Promise<void> {
    if (!env.smtp.user) {
      // Dev fallback: log instead of sending, so the flow is testable without SMTP creds.
      logger.warn('SMTP not configured - logging email instead of sending', { to, subject });
      logger.debug(html);
      return;
    }
    await this.transporter.sendMail({ from: env.smtp.from, to, subject, html, attachments });
  }

  async sendInterviewInvite(to: string, name: string, jobTitle: string, scheduledAt: Date, durationMinutes: number, interviewUrl: string) {
    const endAt = new Date(scheduledAt.getTime() + durationMinutes * 60000);
    const event: EventAttributes = {
      start: [scheduledAt.getFullYear(), scheduledAt.getMonth() + 1, scheduledAt.getDate(), scheduledAt.getHours(), scheduledAt.getMinutes()],
      end: [endAt.getFullYear(), endAt.getMonth() + 1, endAt.getDate(), endAt.getHours(), endAt.getMinutes()],
      title: `HireAI Interview: ${jobTitle}`,
      description: `Join your interview here: ${interviewUrl}`,
      location: 'HireAI Virtual Platform',
      url: interviewUrl,
      status: 'CONFIRMED',
      organizer: { name: 'HireAI Recruitment', email: 'no-reply@hireai.com' }
    };

    let attachments: { filename: string; content: string }[] = [];
    createEvent(event, (error, value) => {
      if (!error && value) {
        attachments.push({ filename: 'invite.ics', content: value });
      } else {
        logger.error('Failed to create ICS event', error);
      }
    });

    await this.send({
      to,
      subject: `Interview Invitation: ${jobTitle}`,
      html: `<p>Hi ${name},</p><p>You have been invited to an interview for <strong>${jobTitle}</strong>.</p>
             <p>It is scheduled for ${scheduledAt.toLocaleString()} for ${durationMinutes} minutes.</p>
             <p><a href="${interviewUrl}">Click here to join your interview</a></p>
             <p>A calendar invite is attached.</p>`,
      attachments
    });
  }

  async sendVerificationEmail(to: string, name: string, verifyUrl: string) {
    await this.send({
      to,
      subject: 'Verify your HireAI account',
      html: `<p>Hi ${name},</p><p>Please verify your email by clicking the link below:</p>
             <p><a href="${verifyUrl}">Verify Email</a></p>
             <p>This link expires in 24 hours.</p>`,
    });
  }

  async sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
    await this.send({
      to,
      subject: 'Reset your HireAI password',
      html: `<p>Hi ${name},</p><p>We received a request to reset your password. Click below to set a new one:</p>
             <p><a href="${resetUrl}">Reset Password</a></p>
             <p>If you didn't request this, you can safely ignore this email. This link expires in 1 hour.</p>`,
    });
  }

  async sendInterviewReminder(to: string, name: string, jobTitle: string, scheduledAt: Date) {
    await this.send({
      to,
      subject: `Reminder: your ${jobTitle} interview is coming up`,
      html: `<p>Hi ${name},</p><p>This is a reminder that your interview for <strong>${jobTitle}</strong> is scheduled at ${scheduledAt.toLocaleString()}.</p>`,
    });
  }

  async sendInterviewResult(to: string, name: string, jobTitle: string, score: number) {
    await this.send({
      to,
      subject: `Your ${jobTitle} interview results are ready`,
      html: `<p>Hi ${name},</p><p>Your interview for <strong>${jobTitle}</strong> has been scored: <strong>${score}/100</strong>. Log in to HireAI to view full feedback.</p>`,
    });
  }
}

export const emailService = new EmailService();
