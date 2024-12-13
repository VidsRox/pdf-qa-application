from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain.document_loaders import PyPDFLoader
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain.llms import OpenAI
import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import logging

# Logging configuration for debugging and information messages
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure the FAISS library is installed, as it is critical for vector storage
try:
    import faiss
except ImportError:
    raise ImportError(
        "The faiss library is required but not installed. Please install it using "
        "`pip install faiss-cpu` for CPU-only systems or `pip install faiss-gpu` for CUDA-enabled GPUs."
    )

# Database setup
DATABASE_URL = "postgresql://neondb_owner:Tw7yiq9YzkoB@ep-yellow-voice-a5pjm4n7-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# ORM model for storing document metadata
class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)  # Primary key for the table
    filename = Column(String, unique=True, index=True)  # Unique filename of the uploaded document
    upload_date = Column(DateTime, default=datetime.utcnow)  # Timestamp of file upload

# Create database schema
Base.metadata.create_all(bind=engine)

# Initialize the FastAPI application
app = FastAPI()

# Configure CORS to allow cross-origin requests (use specific origins in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directory for storing uploaded files
UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Endpoint for uploading PDF files
@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    Handles file uploads.
    Saves the file to the server, checks for duplicates, and stores metadata in the database.
    """
    try:
        # Save the uploaded file to the specified directory
        file_location = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())

        # Check if the filename already exists in the database
        db = SessionLocal()
        existing_doc = db.query(Document).filter_by(filename=file.filename).first()
        if existing_doc:
            db.close()
            raise HTTPException(status_code=400, detail="File already exists.")

        # Save the metadata of the new file in the database
        new_doc = Document(filename=file.filename)
        db.add(new_doc)
        db.commit()
        db.close()

        return {"message": "File uploaded successfully", "filename": file.filename}
    except Exception as e:
        logger.error(f"File upload failed: {e}")
        raise HTTPException(status_code=500, detail="File upload failed.")

# Endpoint for asking questions about uploaded PDFs
@app.post("/ask/")
async def ask_question(filename: str = Form(...), question: str = Form(...)):
    """
    Processes user queries related to uploaded PDFs.
    Uses LangChain and OpenAI to extract information and generate answers.
    """
    try:
        # Check if the requested file exists on the server
        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            raise HTTPException(status_code=404, detail="File not found")

        # Extract text content from the PDF using LangChain
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        # Generate embeddings for the extracted text using OpenAI
        embeddings = OpenAIEmbeddings()
        vectorstore = FAISS.from_documents(documents, embeddings)

        # Set up the retrieval-based QA system
        retriever = vectorstore.as_retriever()
        llm = OpenAI()  # Requires OpenAI API key
        qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever, return_source_documents=False)

        # Process the user's question and generate an answer
        answer = qa_chain.run(question)

        return {"answer": answer}
    except Exception as e:
        logger.error(f"Error processing question: {e}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your question.")
