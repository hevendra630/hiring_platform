export type UserRole = 'candidate' | 'recruiter' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isEmailVerified: boolean;
  company?: string;
  createdAt: string;
}

export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data?: T;
}

export interface ApiFailure {
  success: false;
  statusCode: number;
  message: string;
  details?: { field: string; message: string }[];
}
