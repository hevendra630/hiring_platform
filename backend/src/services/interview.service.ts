import { interviewRepository, CreateInterviewInput } from '@repositories/interview.repository';
import { IInterview, InterviewStatus } from '@models/Interview';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';
import { User } from '@models/User';
import { jobService } from './job.service';

export class InterviewService {
  async scheduleInterview(recruiterId: string, input: CreateInterviewInput & { aiPersona?: any }): Promise<IInterview> {
    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== 'recruiter') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only recruiters can schedule interviews');
    }

    // Verify job belongs to recruiter
    const job = await jobService.getJobById(input.job as string);
    if (job.createdBy.toString() !== recruiterId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'You can only schedule interviews for your own jobs');
    }

    // Ensure input uses the recruiter's company
    const interviewData = {
      ...input,
      company: recruiter.company || recruiterId, // fallback for MVP
    };

    return interviewRepository.create(interviewData);
  }

  async getMyInterviewsAsCandidate(candidateId: string): Promise<IInterview[]> {
    return interviewRepository.findByCandidateId(candidateId);
  }

  async getMyInterviewsAsRecruiter(recruiterId: string): Promise<IInterview[]> {
    const recruiter = await User.findById(recruiterId);
    if (!recruiter || recruiter.role !== 'recruiter') {
      throw new ApiError(httpStatus.FORBIDDEN, 'Only recruiters can access this');
    }
    const companyId = recruiter.company || recruiterId; // fallback for MVP
    return interviewRepository.findByCompanyId(companyId as string);
  }

  async updateInterviewStatus(id: string, userId: string, role: 'candidate' | 'recruiter', status: InterviewStatus): Promise<IInterview> {
    const interview = await interviewRepository.findById(id);
    if (!interview) throw new ApiError(httpStatus.NOT_FOUND, 'Interview not found');

    if (role === 'candidate') {
      if (interview.candidate._id.toString() !== userId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized');
      }
      // Candidates can only start or complete interviews
      if (!['in_progress', 'completed'].includes(status)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Candidates can only start or complete an interview');
      }
      
      // If starting, ensure we are not too early (allow 5 minute buffer)
      if (status === 'in_progress' && interview.status === 'scheduled' && interview.scheduledAt) {
        const now = new Date();
        const scheduled = new Date(interview.scheduledAt as any);
        const diffMinutes = (scheduled.getTime() - now.getTime()) / (1000 * 60);
        if (diffMinutes > 5) {
          throw new ApiError(httpStatus.BAD_REQUEST, `You cannot start this interview yet. It is scheduled for ${scheduled.toLocaleString()}`);
        }
      }
      
    } else {
      // Recruiter check (simplified for MVP: checking if they are the creator of the job is better, 
      // but let's just assume recruiters from the same company can modify it)
      const recruiter = await User.findById(userId);
      const companyId = recruiter?.company?.toString() || userId;
      
      const interviewCompanyId = (interview.company as any)._id?.toString() || interview.company.toString();

      if (interviewCompanyId !== companyId) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to manage this interview');
      }
    }

    // Score calculation on completion
    if (status === 'completed' && interview.status === 'in_progress') {
      if (interview.turns && interview.turns.length > 0) {
        let totalScore = 0;
        let evaluatedTurns = 0;
        for (const turn of interview.turns) {
          if (turn.score !== undefined) {
            totalScore += turn.score;
            evaluatedTurns++;
          }
        }
        if (evaluatedTurns > 0) {
          // Average score out of 10, converted to out of 100
          const avgScore = totalScore / evaluatedTurns;
          const overallScore = Math.round(avgScore * 10);
          
          await interviewRepository.updateById(id, { overallScore });
        }
      }
    }

    const updated = await interviewRepository.updateStatus(id, status);
    return updated!;
  }

  async logProctoringEvent(id: string, candidateId: string, event: { type: string, timestamp: string, details?: string }): Promise<IInterview> {
    const interview = await interviewRepository.findById(id);
    if (!interview) throw new ApiError(httpStatus.NOT_FOUND, 'Interview not found');

    if (interview.candidate._id.toString() !== candidateId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized');
    }

    if (!interview.proctoringEvents) {
      interview.proctoringEvents = [];
    }

    interview.proctoringEvents.push({
      type: event.type,
      timestamp: new Date(event.timestamp),
      details: event.details
    });

    await interview.save();
    return interview;
  }
}

export const interviewService = new InterviewService();
