from fastapi import APIRouter,HTTPException,Body
from pydantic import BaseModel
from typing import List, Optional
from services.embedding import get_embedding
from services.vectorServices import upsert_to_pinecone, get_nearest_neighbors


import umap
import numpy as np
from sklearn.decomposition import PCA


router = APIRouter()


class createVectorSchema(BaseModel):
    is_active: bool
    difficulty_level: float
    subject_id: int
    exam_types: List[int]
    sub_topics: List[int]
    micro_sub_topics: List[int]
    vektor_txt: str
    source_id: int
    question_id: str


class manufacturerSimilarQuestionSchema(BaseModel):
    question_id: str
    filter:dict


















def smart_reduce_to_3d(matches):
    vectors = np.array([m["values"] for m in matches])
    n_samples = len(vectors)
    
    if n_samples == 0:
        return []

    if n_samples == 1:
        embeddings_3d = np.array([[0.0, 0.0, 0.0]])
        

    elif n_samples < 6:
 
        pca = PCA(n_components=min(3, n_samples))
        embeddings_3d = pca.fit_transform(vectors)
        
        if embeddings_3d.shape[1] < 3:
            padding = np.zeros((n_samples, 3 - embeddings_3d.shape[1]))
            embeddings_3d = np.hstack((embeddings_3d, padding))

  
    else:
        reducer = umap.UMAP(
            n_components=3, 
            n_neighbors=min(n_samples - 1, 15), 
            min_dist=0.1, 
            metric='cosine'
        )
        embeddings_3d = reducer.fit_transform(vectors)


    result = []
    for i, m in enumerate(matches):
        result.append({
            "question_id": m["id"],
            "score": m["score"],
            "coords": [float(embeddings_3d[i][0]), float(embeddings_3d[i][1]), float(embeddings_3d[i][2]) ]

        })
    return result





















@router.post("/create-vector")
async def createVector(request: createVectorSchema):
    metadata = request.dict()
    vektor = get_embedding(request.vektor_txt)
    
    if not vektor:
        raise HTTPException(status_code=500, detail="Vektör oluşturulamadı!")
    
    metadata['exam_types'] = [str(x) for x in metadata['exam_types']]
    metadata['sub_topics'] = [str(x) for x in metadata['sub_topics']]
    metadata['micro_sub_topics'] = [str(x) for x in metadata['micro_sub_topics']]

    
    result = upsert_to_pinecone(vektor,metadata,'tr')

    
    if result:
        return True
    else:
        raise HTTPException(status_code=500, detail="Pinecone kayıt hatası oluştu.")
    



@router.post("/manufacturer-similar-question")
async def manufacturerSimilarQuestion(request: manufacturerSimilarQuestionSchema ):

    result = get_nearest_neighbors(request.question_id,request.filter)
    x = smart_reduce_to_3d(result)


    return x