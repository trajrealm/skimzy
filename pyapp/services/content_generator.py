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
Return the result as JSON like this:
{{
  "title": "A short descriptive title",
  "summary": "Summarized markdown here with ## headings and bullet points.",
  "flashcards": [
    {{"question": "Q1", "answer": "A1"}},
    ...
  ],
  "mcqs": [
    {{
      "question": "Q1",
      "options": ["A", "B", "C", "D"],
      "answer": "B"
    }},
    ...
  ]
}}

- "summary" should be very descriptive without missing any important and critical points.
- "flashcards" should be around 10 or more objects depending on the number of paragraphs in the article. If article is short, you can return less flashcards.
- "mcqs" should be around 10 or more objects depending on the number of paragraphs in the article. If article is short, you can return less mcqs.

DO NOT RETURN LEADING OR TRAILING QUOTES like ``` or JSON
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # or "gpt-3.5-turbo"
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            # max_tokens=1500,
        )
        content = response.choices[0].message.content
        
        return {"output": content.replace("```", "")}

    except Exception as e:
        return {"error": str(e)}
