import { useState, useEffect, useCallback } from 'react';
import { chatService } from '../api';
import { ChatUIMessage } from '../types/api';
import { useAuth } from '../hooks/useAuthContext';

export const useChat = (libraryItemId: number) => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChatHistory = useCallback(async () => {
    if (!token || !libraryItemId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const chatHistory = await chatService.getChatHistory(libraryItemId, token);
      
      // Transform chat history to messages format
      const transformedMessages: ChatUIMessage[] = chatHistory.flatMap(chat => [
        {
          id: chat.id * 2 - 1, // Generate unique IDs for questions
          role: 'user' as const,
          text: chat.question,
          timestamp: chat.timestamp,
        },
        {
          id: chat.id * 2, // Generate unique IDs for answers
          role: 'assistant' as const, 
          text: chat.answer,
          timestamp: chat.timestamp,
        },
      ]);
      
      setMessages(transformedMessages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chat history';
      setError(errorMessage);
      console.error('Error fetching chat history:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, libraryItemId]);

  const askQuestion = useCallback(async (question: string) => {
    if (!token || !libraryItemId) throw new Error('Missing token or library item ID');
    
    setIsAsking(true);
    setError(null);
    
    // Add user message immediately for better UX
    const tempUserMessage: ChatUIMessage = {
      id: Date.now(),
      role: 'user' as const,
      text: question,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);
    
    try {
      const response = await chatService.askQuestion(question, libraryItemId, token);
      
      // Add assistant response
      const assistantMessage: ChatUIMessage = {
        id: Date.now() + 1,
        role: 'assistant' as const,
        text: response.answer,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      return response;
    } catch (err) {
      // Remove the temp user message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempUserMessage.id));
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to ask question';
      setError(errorMessage);
      throw err;
    } finally {
      setIsAsking(false);
    }
  }, [token, libraryItemId]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-fetch chat history on mount
  useEffect(() => {
    if (token && libraryItemId) {
      fetchChatHistory();
    }
  }, [token, libraryItemId, fetchChatHistory]);

  return {
    messages,
    isLoading,
    isAsking,
    error,
    askQuestion,
    fetchChatHistory,
    clearError,
    clearMessages,
  };
};