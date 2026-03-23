from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def get_embedding(text: str):

    try:
        text = text.replace("\n", " ")
        
        response = client.embeddings.create(
            input=[text],
            model="text-embedding-3-large" 
        )
        
        return response.data[0].embedding
    except Exception as e:
        print(f"OpenAI Hatası: {e}")
        return None