import apiClient from './client';
import { 
  LibraryItem, 
  GenerateFromUrlRequest, 
  GenerateFromUrlResponse,
  FlashCard,
  MCQ
} from '../types/api';

// Define server response interface for library items
interface ServerLibraryItem {
  id: number;
  title: string;
  source?: string;
  url_or_path?: string;
  created_at: string;
  snippet?: string;
  summary?: string;
  flashcards?: FlashCard[];
  mcqs?: MCQ[];
}

export const libraryService = {
  /**
   * Get all library items for the current user
   */
  async getLibraryItems(token: string): Promise<LibraryItem[]> {
    const data = await apiClient.get<ServerLibraryItem[]>('library', token);
    
    // Transform the response to match our frontend LibraryItem interface
    return data.map((item: ServerLibraryItem) => ({
      id: item.id.toString(),
      title: item.title,
      source: item.source || item.url_or_path || 'Unknown source',
      dateAdded: item.created_at,
      created_at: item.created_at,
      snippet: item.snippet,
      summary: item.summary,
      flashcards: item.flashcards,
      mcqs: item.mcqs,
      hasSummary: !!item.snippet || !!item.summary,
      hasFlashcards: !!(item.flashcards?.length),
      hasQA: !!(item.mcqs?.length),
    }));
  },

  /**
   * Get a specific library item by ID
   */
  async getLibraryItem(id: string, token: string): Promise<LibraryItem> {
    const item = await apiClient.get<ServerLibraryItem>(`library/${id}`, token);
    
    // Transform the response to match our frontend LibraryItem interface
    return {
      id: item.id.toString(),
      title: item.title,
      source: item.source || item.url_or_path || 'Unknown source',
      dateAdded: item.created_at,
      created_at: item.created_at,
      snippet: item.snippet,
      summary: item.summary,
      flashcards: item.flashcards,
      mcqs: item.mcqs,
      hasSummary: !!item.snippet || !!item.summary,
      hasFlashcards: !!(item.flashcards?.length),
      hasQA: !!(item.mcqs?.length),
    };
  },

  /**
   * Generate content from URL
   */
  async generateFromUrl(url: string, token: string): Promise<GenerateFromUrlResponse> {
    const data: GenerateFromUrlRequest = { url };
    return apiClient.post<GenerateFromUrlResponse>('generate-from-url', data, token);
  },

  /**
   * Delete a library item
   */
  async deleteLibraryItem(id: string, token: string): Promise<void> {
    return apiClient.delete<void>(`library/${id}`, token);
  },

  /**
   * Upload and process PDF
   */
  async uploadPdf(file: File, token: string): Promise<GenerateFromUrlResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.postFormData<GenerateFromUrlResponse>('upload_pdf/process', formData, token);
  },
};