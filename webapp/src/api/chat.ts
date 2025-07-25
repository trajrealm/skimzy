import apiClient from './client';
import { 
  ChatMessage, 
  AskQuestionRequest, 
  AskQuestionResponse 
} from '../types/api';

export const chatService = {
  /**
   * Get chat history for a specific library item
   */
  async getChatHistory(libraryItemId: number, token: string): Promise<ChatMessage[]> {
    return apiClient.get<ChatMessage[]>(`chat-history/${libraryItemId}`, token);
  },

  /**
   * Ask a question about a library item
   */
  async askQuestion(question: string, libraryItemId: number, token: string): Promise<AskQuestionResponse> {
    const data: AskQuestionRequest = {
      question,
      library_item_id: libraryItemId,
    };
    
    return apiClient.post<AskQuestionResponse>('ask-question', data, token);
  },
};