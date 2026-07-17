import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export interface Interview {
  _id: string;
  candidate: { _id: string; name: string; email: string };
  job: { _id: string; title: string };
  company: { _id: string; name: string };
  type: 'ai' | 'coding' | 'combined';
  status: 'scheduled' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  durationMinutes: number;
  overallScore?: number;
}

export const useMyInterviews = () => {
  return useQuery({
    queryKey: ['myInterviews'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Interview[] }>('/interviews/me');
      return response.data.data;
    },
  });
};

export const useUpdateInterviewStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Interview['status'] }) => {
      const response = await apiClient.put<{ success: boolean; data: Interview }>(`/interviews/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
    },
  });
};

export const useScheduleInterview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { candidate: string; job: string; type: string; scheduledAt: string; durationMinutes: number; aiPersona?: any }) => {
      const response = await apiClient.post<{ success: boolean; data: Interview }>('/interviews/schedule', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterviews'] });
    },
  });
};

export const useLogProctoringEvent = () => {
  return useMutation({
    mutationFn: async ({ id, type, details }: { id: string; type: string; details?: string }) => {
      const response = await apiClient.post<{ success: boolean; data: Interview }>(`/interviews/${id}/proctoring`, {
        type,
        timestamp: new Date().toISOString(),
        details
      });
      return response.data.data;
    }
  });
};
