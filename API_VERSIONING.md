# API Versioning Implementation

This document describes the versioned API structure that was implemented for the Skimzy application.

## Structure

The API is now organized with version-specific folders:

```
pyapp/api/
├── v1/                     # Version 1 API
│   ├── __init__.py
│   ├── router.py          # Main v1 router configuration
│   └── routes/            # V1 route modules
│       ├── __init__.py
│       ├── auth.py        # Authentication endpoints
│       ├── library_items.py  # Library management endpoints  
│       ├── main.py        # Core API endpoints
│       └── pdf_upload.py  # PDF upload endpoints
├── routes/                # Legacy route modules (for backward compatibility)
│   ├── auth.py
│   ├── library_items.py
│   └── pdf_upload.py
└── legacy.py             # Legacy router for backward compatibility
```

## Available Endpoints

### V1 API (Prefixed with `/api/v1/`)

**Authentication:**
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login

**Library Management:**
- `GET /api/v1/library` - Get user's library items
- `GET /api/v1/library/{item_id}` - Get specific library item
- `DELETE /api/v1/library/{item_id}` - Delete library item

**PDF Upload:**
- `POST /api/v1/upload-pdf` - Upload PDF file
- `POST /api/v1/upload_pdf/process` - Upload and process PDF

**Core API:**
- `GET /api/v1/extract` - Extract content from URL
- `POST /api/v1/generate` - Generate summary and flashcards
- `POST /api/v1/generate-from-url` - Generate content from URL
- `POST /api/v1/ask-question` - Ask question about content
- `GET /api/v1/chat-history/{library_item_id}` - Get chat history

### Legacy API (Prefixed with `/api/`)

For backward compatibility, the following endpoints remain available:

**Authentication:**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

**Library Management:**
- `GET /api/library` - Get user's library items
- `GET /api/library/{item_id}` - Get specific library item
- `DELETE /api/library/{item_id}` - Delete library item

**PDF Upload:**
- `POST /api/upload-pdf` - Upload PDF file  
- `POST /api/upload_pdf/process` - Upload and process PDF

**Core API:**
- `GET /api/extract` - Extract content from URL
- `POST /api/generate` - Generate summary and flashcards
- `POST /api/generate-from-url` - Generate content from URL
- `POST /api/ask-question` - Ask question about content
- `GET /api/chat-history/{library_item_id}` - Get chat history

## Implementation Details

1. **V1 Router**: Combines all v1 route modules with `/v1` prefix
2. **Legacy Support**: Maintains existing API endpoints for backward compatibility
3. **Minimal Changes**: Existing functionality preserved while adding versioned structure
4. **Future-Ready**: Easy to add v2, v3, etc. by creating new version folders

## Migration Path

- **Current clients**: Can continue using existing `/api/*` endpoints
- **New clients**: Should use versioned `/api/v1/*` endpoints  
- **Future versions**: Will be available as `/api/v2/*`, `/api/v3/*`, etc.

The versioned structure allows for API evolution while maintaining backward compatibility.