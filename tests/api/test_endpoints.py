"""
Test API endpoints.
"""
import pytest


class TestContentAPI:
    """Test cases for content API endpoints."""
    
    def test_extract_endpoint_exists(self, client):
        """Test that extract endpoint is accessible."""
        response = client.get("/api/extract?url=https://example.com")
        
        # Should not return 404
        assert response.status_code != 404
        
        # Should return proper structure
        data = response.json()
        assert "length" in data
        assert "snippet" in data


class TestHealthCheck:
    """Test basic application health."""
    
    def test_app_starts(self, client):
        """Test that the application starts and serves content."""
        response = client.get("/")
        
        # Should not crash
        assert response.status_code in [200, 404]  # 404 is ok if frontend not built