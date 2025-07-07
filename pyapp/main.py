from fastapi import Query, FastAPI
from fastapi import Request, Response

from pyapp.utils.parser import extract_main_content
from pyapp.services.content_generator import generate_summary_and_flashcards
from fastapi.middleware.cors import CORSMiddleware
from pyapp.api.routes import auth

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ You can restrict this later to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/extract")
def extract(url: str = Query(...)):
    content = extract_main_content(url)
    return {"length": len(content), "snippet": content}


@app.post("/generate")
async def generate(request: Request):
    body = await request.json()
    text = body.get("text", "")
    return generate_summary_and_flashcards(text)

from pyapp.utils.parser import extract_main_content

@app.post("/generate-from-url")
async def generate_from_url(request: Request):
    body = await request.json()
    url = body.get("url")
    if not url:
        return {"error": "URL is required"}

    text = extract_main_content(url)
    result = generate_summary_and_flashcards(text)
    if "output" in result:
        return Response(content=result["output"], media_type="text/markdown")
    else:
        return result
