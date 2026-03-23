from dotenv import load_dotenv 
load_dotenv()
from fastapi import FastAPI
from api.createVector import router as createVector

app = FastAPI()


app.include_router(createVector)

@app.get("/")
def main():
    return {"message": "Sistem ayakta, /docs adresine git."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)