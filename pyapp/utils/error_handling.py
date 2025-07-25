"""
Global error handling for the application.
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback

logger = logging.getLogger(__name__)


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """
    Handle HTTP exceptions globally.
    
    Args:
        request: The request that caused the exception
        exc: The HTTP exception
        
    Returns:
        JSON response with error details
    """
    logger.warning(
        f"HTTP {exc.status_code} error on {request.method} {request.url}: {exc.detail}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.status_code,
                "message": exc.detail,
                "type": "http_error"
            }
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle general exceptions globally.
    
    Args:
        request: The request that caused the exception
        exc: The exception
        
    Returns:
        JSON response with error details
    """
    logger.error(
        f"Unhandled exception on {request.method} {request.url}: {str(exc)}\n"
        f"Traceback: {traceback.format_exc()}"
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
                "type": "server_error"
            }
        }
    )


def setup_exception_handlers(app) -> None:
    """
    Setup global exception handlers for the FastAPI app.
    
    Args:
        app: FastAPI application instance
    """
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)