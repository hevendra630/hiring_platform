import { submissionRepository, CreateSubmissionInput } from '@repositories/submission.repository';
import { problemService } from '@services/problem.service';
import { sandboxService } from '@services/sandbox.service';
import { ISubmission, ITestCaseResult, SubmissionStatus } from '@models/Submission';
import { SupportedLanguage } from '@models/CodingProblem';

export class SubmissionService {
  async submitCode(candidateId: string, problemId: string, language: SupportedLanguage, sourceCode: string, isFinal: boolean = true): Promise<ISubmission> {
    const problem = await problemService.getProblemById(problemId);
    
    // Choose test cases (only sample if not final)
    const testCasesToRun = isFinal 
      ? [...problem.sampleTestCases, ...problem.hiddenTestCases]
      : problem.sampleTestCases;

    const testCaseResults: ITestCaseResult[] = [];
    let totalWeight = 0;
    let earnedWeight = 0;
    let overallExecutionTime = 0;
    let status: SubmissionStatus = 'accepted';

    for (const testCase of testCasesToRun) {
      totalWeight += testCase.weight;

      // Sandbox Execution
      const result = await sandboxService.executeCode(language, sourceCode, testCase.input, problem.timeLimitMs);
      
      let passed = false;
      let errorMessage = result.error;

      if (!errorMessage) {
        // Compare output
        const actualOutput = result.output.trim();
        const expectedOutput = testCase.expectedOutput.trim();
        passed = actualOutput === expectedOutput;
        
        if (!passed && status === 'accepted') {
          status = 'wrong_answer';
        }
      } else {
        if (errorMessage.includes('Time Limit')) {
          status = 'time_limit_exceeded';
        } else {
          status = 'runtime_error';
        }
      }

      if (passed) {
        earnedWeight += testCase.weight;
      }

      overallExecutionTime += result.executionTimeMs;

      testCaseResults.push({
        passed,
        isHidden: testCase.isHidden,
        runtimeMs: result.executionTimeMs,
        output: testCase.isHidden ? undefined : result.output,
        expectedOutput: testCase.isHidden ? undefined : testCase.expectedOutput,
        errorMessage: errorMessage || undefined
      });
    }

    const score = totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 0;

    const submissionData: CreateSubmissionInput = {
      candidate: candidateId,
      problem: problemId,
      language,
      sourceCode,
      isFinalSubmission: isFinal,
      status: status,
      score,
      testCaseResults,
      executionTimeMs: overallExecutionTime
    };

    return submissionRepository.create(submissionData);
  }

  async getMySubmissionsForProblem(candidateId: string, problemId: string): Promise<ISubmission[]> {
    return submissionRepository.findByCandidateAndProblem(candidateId, problemId);
  }
}

export const submissionService = new SubmissionService();
