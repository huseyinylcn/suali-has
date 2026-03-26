import os
from pinecone import Pinecone
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
import umap
import numpy as np
from sklearn.decomposition import PCA



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





def get_nearest_neighbors(vector_id,raw_filter, top_k=50):

    try:
        active_filter = {k: v for k, v in raw_filter.items() if v is not None}
      
        query_response = index.query(
            id=vector_id, 
            top_k=top_k, 
            namespace="tr",
            
            include_values=True, 
            include_metadata=False,
            filter=active_filter
            
        )

        query_dict = query_response.to_dict()
        filtered_matches = [
            match for match in query_dict.get("matches", []) 
            if match["score"] >= 0
        ]
        
        return filtered_matches
    except Exception as e:
        print(f"Hata oluştu: {e}")
        return None
