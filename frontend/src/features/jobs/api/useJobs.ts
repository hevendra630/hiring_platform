import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export interface Job {
  _id: string;
  title: string;
  companyName: string;
  description: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  employmentType: 'full-time' | 'part-time' | 'internship' | 'contract';
  location: string;
  isRemote: boolean;
  applicantsCount: number;
  createdAt: string;
}

export interface CreateJobData {
  title: string;
  companyName: string;
  description: string;
  employmentType: string;
  location: string;
  isRemote: boolean;
  status: string;
  aiInterviewConfig: {
    enabled: boolean;
    technicalQuestionCount: number;
    behavioralQuestionCount: number;
    durationMinutes: number;
  };
}

export const useMyJobs = () => {
  return useQuery({
    queryKey: ['myJobs'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Job[] }>('/jobs/my-jobs');
      return response.data.data;
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateJobData) => {
      const response = await apiClient.post<{ success: boolean; data: Job }>('/jobs', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      const response = await apiClient.put<{ success: boolean; data: Job }>(`/jobs/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<{ success: boolean }>(`/jobs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myJobs'] });
    },
  });
};
