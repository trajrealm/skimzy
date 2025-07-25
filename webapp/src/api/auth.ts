import apiClient from './client';
import { AuthResponse, User } from '../types/api';

export interface LoginRequest {
  username: string; // API expects username field for email
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new FormData();
    formData.append('username', email); // FastAPI OAuth2PasswordRequestForm expects 'username'
    formData.append('password', password);
    
    return apiClient.postFormData<AuthResponse>('auth/login', formData);
  },

  /**
   * Register new user
   */
  async signup(email: string, password: string): Promise<User> {
    const data: SignupRequest = { email, password };
    return apiClient.post<User>('auth/signup', data);
  },

  /**
   * Get current user profile (if needed in the future)
   */
  async getProfile(token: string): Promise<User> {
    return apiClient.get<User>('auth/profile', token);
  },

  /**
   * Refresh token (if implemented in the future)
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>('auth/refresh', { refresh_token: refreshToken });
  },
};