"""
Test content extraction service.
"""
import pytest
from pyapp.services.content_extraction import ContentExtractionService


class TestContentExtractionService:
    """Test cases for ContentExtractionService."""
    
    def test_extract_url_content_structure(self):
        """Test that extract_url_content returns correct structure."""
        service = ContentExtractionService()
        
        # Mock URL - the actual extraction will depend on the URL parser
        result = service.extract_url_content("https://example.com")
        
        # Verify response structure
        assert isinstance(result, dict)
        assert "length" in result
        assert "snippet" in result
        assert isinstance(result["length"], int)
        assert isinstance(result["snippet"], str)
        
        # Length should match snippet length
        assert result["length"] == len(result["snippet"])