import { resumeRepository, CreateResumeInput } from '@repositories/resume.repository';
import { IResume, IResumeAnalysis } from '@models/Resume';
import { ApiError } from '@utils/ApiError';
import httpStatus from 'http-status';

export class ResumeService {
  async saveOrUpdateResume(candidateId: string, input: Partial<CreateResumeInput> & { analysis?: Partial<IResumeAnalysis> }): Promise<IResume> {
    let resume = await resumeRepository.findByCandidateId(candidateId);

    if (resume) {
      if (input.analysis) {
        const updated = await resumeRepository.updateAnalysis(resume._id, input.analysis);
        if (updated) resume = updated;
      }
      if (input.fileUrl) {
        const updated = await resumeRepository.updateById(resume._id, {
          fileUrl: input.fileUrl,
          cloudinaryPublicId: input.cloudinaryPublicId,
          originalFileName: input.originalFileName,
        });
        if (updated) resume = updated;
      }
      return resume;
    }

    // Creating a new one (mocking the file upload if not provided for MVP)
    const newResumeData: CreateResumeInput = {
      candidate: candidateId,
      fileUrl: input.fileUrl || 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
      cloudinaryPublicId: input.cloudinaryPublicId || 'sample',
      originalFileName: input.originalFileName || 'resume.pdf',
      analysis: input.analysis as IResumeAnalysis | undefined,
    };

    return resumeRepository.create(newResumeData);
  }

  async getMyResume(candidateId: string): Promise<IResume> {
    const resume = await resumeRepository.findByCandidateId(candidateId);
    if (!resume) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No resume found for this candidate');
    }
    return resume;
  }

  async parseResume(buffer: Buffer): Promise<IResumeAnalysis> {
    let text = '';
    try {
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const data = await parser.getText();
      text = data.text;
      await parser.destroy();
    } catch (error) {
      console.error('PDF Parse Error:', error);
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to parse PDF file. Ensure it is a valid PDF.');
    }

    // 2. Fetch Open Jobs for matching
    const { jobService } = require('./job.service');
    let openJobsContext = '';
    try {
      const publishedJobs = await jobService.getAllPublishedJobs();
      if (publishedJobs && publishedJobs.length > 0) {
        const jobsList = publishedJobs.map((j: any) => `- ${j.title} (Requires: ${j.requiredSkills.join(', ')})`).join('\n');
        openJobsContext = `\n\nCompare the candidate's skills against these currently open jobs at our company:\n${jobsList}\nIn the "suitableRoles" array, include any of these open jobs that are a strong match.`;
      }
    } catch (err) {
      console.error('Failed to fetch jobs for matching', err);
    }

    // 3. Call OpenAI or mock
    const { OpenAI } = require('openai');
    if (process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `
        Analyze this resume text and extract the following into a valid JSON object:
        {
          "summary": "Professional summary (2-3 sentences)",
          "extractedSkills": ["skill1", "skill2"],
          "education": [{"degree": "...", "institution": "...", "year": "..."}],
          "experience": [{"title": "...", "company": "...", "durationMonths": 12, "summary": "..."}],
          "projects": [{"name": "...", "description": "...", "techStack": ["..."]}],
          "atsScore": 85,
          "missingSkills": ["Cloud", "CI/CD"],
          "suitableRoles": ["Frontend Developer"],
          "improvementSuggestions": ["Add metrics"]
        }
        ${openJobsContext}
        Resume Text: ${text.substring(0, 3000)}
      `;

      try {
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });
        
        const content = response.choices[0].message.content;
        const analysis = JSON.parse(content || '{}');
        analysis.analyzedAt = new Date();
        return analysis as IResumeAnalysis;
      } catch (err) {
        console.error('OpenAI Error', err);
      }
    }

    // Fallback if no OpenAI Key or error
    return {
      atsScore: 75,
      extractedSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'PDF Extraction'],
      missingSkills: ['AWS', 'Docker'],
      suitableRoles: ['Full Stack Developer', 'Software Engineer'],
      improvementSuggestions: ['Add more quantifiable achievements in your experience section.'],
      education: [{ degree: 'B.S. Computer Science', institution: 'Tech University', year: '2023' }],
      experience: [{ title: 'Software Engineer', company: 'Tech Corp', durationMonths: 24, summary: 'Developed web applications.' }],
      projects: [{ name: 'Resume Analyzer', description: 'Built an AI-powered analyzer', techStack: ['React', 'Node'] }],
      summary: 'Passionate software engineer with experience in modern web technologies.',
      analyzedAt: new Date()
    };
  }
}

export const resumeService = new ResumeService();
