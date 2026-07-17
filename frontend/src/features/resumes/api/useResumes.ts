import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

export interface ResumeAnalysis {
  atsScore?: number;
  extractedSkills?: string[];
  missingSkills?: string[];
  suitableRoles?: string[];
  improvementSuggestions?: string[];
  summary?: string;
  education?: { degree: string; institution: string; year?: string }[];
  experience?: { title: string; company: string; durationMonths?: number; summary?: string }[];
  projects?: { name: string; description: string; techStack: string[] }[];
}

export interface Resume {
  _id: string;
  candidate: string;
  fileUrl: string;
  originalFileName: string;
  analysis?: ResumeAnalysis;
  isActive: boolean;
}

export const useMyResume = () => {
  return useQuery({
    queryKey: ['myResume'],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: Resume }>('/resumes/me');
      return response.data.data;
    },
    retry: false, // Don't retry on 404
  });
};

export const useSaveResume = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { fileUrl?: string; originalFileName?: string; analysis?: ResumeAnalysis }) => {
      const response = await apiClient.post<{ success: boolean; data: Resume }>('/resumes/me', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] });
    },
  });
};

export const useUploadResume = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      const response = await apiClient.post<{ success: boolean; data: Resume }>('/resumes/upload', formData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myResume'] });
    }
  });
};
