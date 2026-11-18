import uvicorn
from fastapi import FastAPI, Request, File, UploadFile, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import List, Optional

from src.config import Config
from src.services.civilai_service import CivilAIService

app = FastAPI(title=Config.PROJECT_NAME)

# Mount static files and templates
app.mount("/static", StaticFiles(directory="src/static"), name="static")
templates = Jinja2Templates(directory="src/templates")

# Initialize Service
civilai_service = CivilAIService()

# Data Models
class ChatQuery(BaseModel):
    user_id: str
    query: str
    lang: Optional[str] = "English"

class AssignmentQuery(BaseModel):
    user_id: str
    problem: str

# Routes
@app.get("/", response_class=HTMLResponse)
async def get_dashboard(request: Request):
    """Serves the main dashboard HTML page."""
    return templates.TemplateResponse("index.html", {"request": request, "project_name": Config.PROJECT_NAME, "developers": Config.DEVELOPERS})

@app.post("/api/chat/qa")
async def civil_qa(data: ChatQuery):
    """Endpoint for generic Civil Engineering QA."""
    try:
        response = civilai_service.civil_qa(data.query, data.lang)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat/assignment")
async def solve_assignment(
    user_id: str,
    problem: str,
    files: Optional[List[UploadFile]] = File(None)
):
    """Endpoint to solve assignments, supporting optional image uploads."""
    try:
        image_data = []
        if files:
            for file in files:
                content = await file.read()
                image_data.append(content)
        
        response = civilai_service.solve_assignment(problem, image_data)
        return {"status": "success", "response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ocr")
async def process_document(file: UploadFile = File(...)):
    """Endpoint to extract text from image or PDF files."""
    try:
        content = await file.read()
        mime_type = file.content_type
        text = civilai_service.process_ocr(content, mime_type)
        return {"status": "success", "extracted_text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "up", "project": Config.PROJECT_NAME}

if __name__ == "__main__":
    Config.validate()
    uvicorn.run("src.app:app", host=Config.HOST, port=Config.PORT, reload=Config.DEBUG)