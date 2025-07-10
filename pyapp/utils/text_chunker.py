from typing import List

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    start = 0
    total_words = len(words)

    while start < total_words:
        end = start + chunk_size
        chunk = words[start:end]
        chunks.append(" ".join(chunk))
        # Move start forward safely; prevent infinite loop when overlap >= chunk_size
        next_start = end - overlap
        if next_start <= start:
            # Ensure start always moves forward by at least 1 to avoid infinite loop
            start += 1
        else:
            start = next_start
    return chunks