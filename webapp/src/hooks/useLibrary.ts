import { useState, useEffect, useCallback } from 'react';
import { libraryService } from '../api';
import { LibraryItem } from '../types/api';
import { useAuth } from '../hooks/useAuthContext';

export const useLibrary = () => {
  const { token } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLibraryItems = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const libraryItems = await libraryService.getLibraryItems(token);
      setItems(libraryItems);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch library items';
      setError(errorMessage);
      console.error('Error fetching library items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const generateFromUrl = useCallback(async (url: string) => {
    if (!token) throw new Error('No authentication token');
    
    setError(null);
    
    try {
      const result = await libraryService.generateFromUrl(url, token);
      // Refresh the library items after successful generation
      await fetchLibraryItems();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate from URL';
      setError(errorMessage);
      throw err;
    }
  }, [token, fetchLibraryItems]);

  const uploadPdf = useCallback(async (file: File) => {
    if (!token) throw new Error('No authentication token');
    
    setError(null);
    
    try {
      const result = await libraryService.uploadPdf(file, token);
      // Refresh the library items after successful upload
      await fetchLibraryItems();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload PDF';
      setError(errorMessage);
      throw err;
    }
  }, [token, fetchLibraryItems]);

  const deleteLibraryItem = useCallback(async (id: string) => {
    if (!token) throw new Error('No authentication token');
    
    setError(null);
    
    try {
      await libraryService.deleteLibraryItem(id, token);
      // Remove the item from local state
      setItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete item';
      setError(errorMessage);
      throw err;
    }
  }, [token]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if token is available
  useEffect(() => {
    if (token) {
      fetchLibraryItems();
    }
  }, [token, fetchLibraryItems]);

  return {
    items,
    isLoading,
    error,
    fetchLibraryItems,
    generateFromUrl,
    uploadPdf,
    deleteLibraryItem,
    clearError,
  };
};

export const useLibraryItem = (id: string) => {
  const { token } = useAuth();
  const [item, setItem] = useState<LibraryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLibraryItem = useCallback(async () => {
    if (!token || !id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const libraryItem = await libraryService.getLibraryItem(id, token);
      setItem(libraryItem);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch library item';
      setError(errorMessage);
      console.error('Error fetching library item:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch on mount if token and id are available
  useEffect(() => {
    if (token && id) {
      fetchLibraryItem();
    }
  }, [token, id, fetchLibraryItem]);

  return {
    item,
    isLoading,
    error,
    fetchLibraryItem,
    clearError,
  };
};