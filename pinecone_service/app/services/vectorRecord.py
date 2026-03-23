import os
from pinecone import Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))



index = pc.Index(os.getenv("PINECONE_INDEX_NAME"))

def upsert_to_pinecone(vector, metadata, country="tr"):
    try:
       
        response = index.upsert(
            vectors=[
                (
                    str(metadata['question_id']), 
                    vector,                       
                    metadata                      
                )
            ],
            namespace=country.lower()  
        )
        return response
    except Exception as e:
        print(f"❌ Pinecone Kayıt Hatası: {e}")
        return None

