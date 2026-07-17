import { Interview } from '@models/Interview';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';

export class AiService {
  async processChatMessage(interviewId: string, candidateId: string, message: string): Promise<string> {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Interview not found');
    }

    if (interview.candidate.toString() !== candidateId) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized');
    }

    if (interview.status !== 'in_progress') {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Interview is not in progress');
    }

    // Try OpenAI integration, fallback to mock if no key
    const { OpenAI } = require('openai');
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const interviewPopulated = await interview.populate('candidate');
        const candidate = interviewPopulated.candidate as any;

        // Fetch GitHub Context
        let githubContext = '';
        if (candidate.githubUsername) {
          try {
            const githubRes = await fetch(`https://api.github.com/users/${candidate.githubUsername}/repos?sort=updated&per_page=3`, {
              headers: { 'User-Agent': 'HireAI-App' }
            });
            if (githubRes.ok) {
              const repos = await githubRes.json();
              if (repos && repos.length > 0) {
                const repoStrings = repos.map((r: any) => `${r.name}: ${r.description || 'No description'}`).join('; ');
                githubContext = ` The candidate has the following recent GitHub repositories: ${repoStrings}. Feel free to ask about them if relevant.`;
              }
            }
          } catch (err) {
            console.error('Failed to fetch github context', err);
          }
        }

        // Determine persona attributes
        const difficulty = interview.aiPersona?.difficulty || 'dynamic';
        const tone = interview.aiPersona?.tone || 'friendly';
        
        let systemPrompt = `You are an AI interviewer for a software engineering position. `;
        systemPrompt += `Your difficulty level is ${difficulty}. `;
        systemPrompt += `Your conversational tone is ${tone}. `;
        systemPrompt += `Ask relevant technical and behavioral questions.${githubContext}`;

        // Build chat history from turns for context, simplified here
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ]
        });

        const reply = response.choices[0].message.content || 'I see. Can you tell me more?';
        
        // Save to interview turns (mocking question ID for MVP)
        interview.turns.push({
          question: '000000000000000000000000' as any, // Mock Question ID
          aiMessage: reply,
          candidateAnswer: message,
          score: 8,
          strengths: [],
          weaknesses: [],
          improvementSuggestions: [],
          answeredAt: new Date()
        });
        await interview.save();

        return reply;
      } catch (err) {
        console.error('OpenAI Error', err);
      }
    }

    const reply = this.mockAiResponse(message);
    interview.turns.push({
      question: '000000000000000000000000' as any,
      aiMessage: reply,
      candidateAnswer: message,
      score: 7,
      strengths: ['Clear communication'],
      weaknesses: ['Lacked depth'],
      improvementSuggestions: ['Provide specific examples'],
      answeredAt: new Date()
    });
    await interview.save();

    return reply;
  }

  private mockAiResponse(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello! I am your AI interviewer today. To get started, could you tell me about a recent challenging project you worked on?';
    }
    if (lower.length < 50) {
      return 'That sounds interesting. Could you elaborate a bit more on your specific role and the technologies you used?';
    }
    return 'Thank you for sharing that. Let us move on to the next question: how do you typically handle technical disagreements with your peers?';
  }
}

export const aiService = new AiService();
