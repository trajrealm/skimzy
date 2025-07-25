import { useState, useCallback } from 'react';
import { authService } from '../api';
import { useAuth } from '../hooks/useAuthContext';

export const useAuthOperations = () => {
  const { login: setAuthToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.login(email, password);
      setAuthToken(response.access_token);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthToken]);

  const signup = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = await authService.signup(email, password);
      // After successful signup, login automatically
      const loginResponse = await authService.login(email, password);
      setAuthToken(loginResponse.access_token);
      return user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setAuthToken]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    login,
    signup,
    isLoading,
    error,
    clearError,
  };
};