from openai import OpenAI
from pyapp.utils.secrets import get_openai_api_key

client = OpenAI(api_key=get_openai_api_key())

def generate_summary_and_flashcards(text: str) -> dict:
    if not text:
        return {"error": "Empty content"}

    prompt = f"""
You are an assistant helping students learn from articles efficiently.

ARTICLE:
{text}

TASKS:
1. Summarize the article using Markdown:
   - Use clear headings (##) for each section
   - Use bullet points or numbered lists where needed

2. Create 5 flashcards formatted as:

### Flashcard 1
**Q:** Question here  
**A:** Answer here

3. Create 5 quiz-style Q&A pairs like:

### Quiz Question 1
**Q:** Question  
**A:** Answer

Respond ONLY in Markdown, clearly formatted and structured.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-3.5-turbo"
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            # max_tokens=1500,
        )
        content = response.choices[0].message.content
        
        return {"output": content}

    except Exception as e:
        return {"error": str(e)}
