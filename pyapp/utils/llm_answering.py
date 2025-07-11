from openai import OpenAI
from typing import List
from pyapp.config import settings

client = OpenAI()

def ask_llm(question: str, context_chunks: List[str]) -> str:
    """
    Uses OpenAI chat model to answer a user question using document chunks as context.

    Args:
        question (str): The user’s question.
        context_chunks (List[str]): Relevant chunks from Qdrant.

    Returns:
        str: GPT-generated answer.
    """
    context_text = "\n\n".join(context_chunks[:5])  # limit context to top 5 chunks

    messages = [
        {
            "role": "system",
            "content": (
                "You are a helpful assistant. First, try to answer the user's question strictly using the provided context. "
                "If the answer is not found in the context, then you may use your broader knowledge, but make it clear by starting your answer with: "
                "NOTE:This answer is not in the provided context. However, based on my wider knowledge, here is a possible answer:\n\n"
                "[your answer here]"
            )
        },
        {
            "role": "user",
            "content": f"Context:\n{context_text}\n\nQuestion: {question}"
        }    
    ]

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()
