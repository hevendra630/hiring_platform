import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;
}

export interface CodingProblem {
  _id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  constraints: string[];
  sampleTestCases: TestCase[];
  starterCode: {
    cpp?: string;
    java?: string;
    python?: string;
    javascript?: string;
  };
}

export interface TestCaseResult {
  passed: boolean;
  isHidden: boolean;
  runtimeMs: number;
  output?: string;
  expectedOutput?: string;
  errorMessage?: string;
}

export interface Submission {
  _id: string;
  language: string;
  sourceCode: string;
  isFinalSubmission: boolean;
  status: string;
  score: number;
  testCaseResults: TestCaseResult[];
  executionTimeMs?: number;
}

export const useGetProblem = (id: string) => {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: CodingProblem }>(`/problems/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};

export const useSubmitCode = () => {
  return useMutation({
    mutationFn: async (data: { problemId: string; language: string; sourceCode: string; isFinal: boolean }) => {
      const response = await apiClient.post<{ success: boolean; data: Submission }>('/submissions', data);
      return response.data.data;
    },
  });
};
