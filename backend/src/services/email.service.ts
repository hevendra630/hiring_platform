import nodemailer, { Transporter } from 'nodemailer';
import { env } from '@config/env';
import { logger } from '@utils/logger';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
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

  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    if (!env.smtp.user) {
      // Dev fallback: log instead of sending, so the flow is testable without SMTP creds.
      logger.warn('SMTP not configured - logging email instead of sending', { to, subject });
      logger.debug(html);
      return;
    }
    await this.transporter.sendMail({ from: env.smtp.from, to, subject, html });
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
