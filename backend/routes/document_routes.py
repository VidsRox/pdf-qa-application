from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import SessionLocal
from models import Document
from dotenv import load_dotenv
from langchain.document_loaders import PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.llms import OpenAI
from typing import List, Optional
import os
import logging
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Configure logging for the application
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise EnvironmentError("OPENAI_API_KEY not found in environment variables.")

# Directory for storing uploaded files
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize FastAPI router
document_routes = APIRouter()

# Utility function to validate file extensions
def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """
    Validate if a file has an allowed extension.
    """
    return filename.split('.')[-1].lower() in allowed_extensions


@document_routes.post("/upload/")
async def upload_file(
    file: UploadFile = File(...), tags: Optional[str] = Form(None), category: Optional[str] = Form(None)
):
    """
    Upload a PDF file, save it locally, and store metadata in the database.
    """
    try:
        # Validate file extension (only PDFs are allowed)
        if not validate_file_extension(file.filename, ["pdf"]):
            logger.warning(f"Unsupported file type: {file.filename}")
            raise HTTPException(status_code=400, detail="Unsupported file type. Only PDFs are allowed.")

        # Save the uploaded file to the upload directory
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        # Check for duplicate filenames in the database
        db = SessionLocal()
        existing_doc = db.query(Document).filter_by(filename=file.filename).first()
        if existing_doc:
            db.close()
            raise HTTPException(status_code=400, detail="File already exists.")

        # Save file metadata (tags and category) in the database
        new_doc = Document(filename=file.filename, tags=tags, category=category)
        db.add(new_doc)
        db.commit()
        db.close()

        logger.info(f"File uploaded successfully: {file.filename}")
        return {"message": "File uploaded successfully", "filename": file.filename, "tags": tags, "category": category}
    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during file upload: {e}")
        raise HTTPException(status_code=500, detail="File upload failed.")


@document_routes.post("/ask/")
async def ask_question(filename: str = Form(...), question: str = Form(...)):
    """
    Ask a question about a specific uploaded PDF using OpenAI and LangChain.
    """
    try:
        # Ensure the file exists in the upload directory
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        # Load and extract text content from the PDF
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        # Generate vector embeddings from the extracted text
        embeddings = OpenAIEmbeddings()
        vectorstore = FAISS.from_documents(documents, embeddings)

        # Set up a question-answering chain
        retriever = vectorstore.as_retriever()
        llm = OpenAI(api_key=OPENAI_API_KEY)  # Use the API key
        qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, return_source_documents=False)

        # Process the user's question and generate an answer
        answer = qa_chain.run(question)

        logger.info(f"Question processed successfully for file: {filename}")
        return {"answer": answer}
    except HTTPException as e:
        logger.error(f"HTTP Exception: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error during question processing: {e}")
        raise HTTPException(status_code=500, detail="Error processing your question.")


@document_routes.get("/search/")
async def search_files(
    query: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category: Optional[str] = None,
):
    """
    Search for files by name, tags, upload date, or category.
    """
    try:
        db = SessionLocal()
        query_filter = db.query(Document)

        # Filter by query (filename or tags)
        if query:
            query_filter = query_filter.filter(
                or_(
                    Document.filename.ilike(f"%{query}%"),
                    Document.tags.ilike(f"%{query}%"),
                )
            )

        # Filter by date range
        if start_date and end_date:
            start_date_obj = datetime.fromisoformat(start_date)
            end_date_obj = datetime.fromisoformat(end_date)
            query_filter = query_filter.filter(
                Document.upload_date.between(start_date_obj, end_date_obj)
            )

        # Filter by category
        if category:
            query_filter = query_filter.filter(Document.category == category)

        # Retrieve and return search results
        results = query_filter.all()
        db.close()

        return [
            {
                "id": doc.id,
                "filename": doc.filename,
                "upload_date": doc.upload_date,
                "tags": doc.tags,
                "category": doc.category,
            }
            for doc in results
        ]
    except Exception as e:
        logger.error(f"Unexpected error during search: {e}")
        raise HTTPException(status_code=500, detail="Error during search.")


@document_routes.delete("/delete/{file_id}/")
async def delete_file(file_id: int):
    """
    Delete a file and its metadata by file ID.
    """
    try:
        db = SessionLocal()
        document = db.query(Document).filter_by(id=file_id).first()
        if not document:
            db.close()
            raise HTTPException(status_code=404, detail="File not found.")

        # Remove the file from the upload directory
        file_path = os.path.join(UPLOAD_DIR, document.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        # Remove metadata from the database
        db.delete(document)
        db.commit()
        db.close()

        return {"message": "File deleted successfully"}
    except Exception as e:
        logger.error(f"Unexpected error while deleting file: {e}")
        raise HTTPException(status_code=500, detail="Error while deleting the file.")
