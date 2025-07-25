"""
Content extraction service for URL processing.
"""
from pyapp.utils.parser import extract_main_content


class ContentExtractionService:
    """Service for extracting content from URLs."""
    
    def extract_url_content(self, url: str) -> dict:
        """
        Extract main content from a URL.
        
        Args:
            url: The URL to extract content from
            
        Returns:
            Dict with length and snippet of extracted content
        """
        content = extract_main_content(url)
        return {
            "length": len(content),
            "snippet": content
        }