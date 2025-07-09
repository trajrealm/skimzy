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
