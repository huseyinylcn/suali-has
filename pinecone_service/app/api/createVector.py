from fastapi import APIRouter,HTTPException
from pydantic import BaseModel
from typing import List, Optional
from services.embedding import get_embedding
from services.vectorRecord import upsert_to_pinecone


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
    
