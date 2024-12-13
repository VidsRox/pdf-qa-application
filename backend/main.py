from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.document_routes import document_routes
from database import Base, engine

# Initialize the FastAPI app
app = FastAPI()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production for specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the routes from document_routes
app.include_router(document_routes)

# Create database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def read_root():
    return {"message": "Welcome to the PDF Q&A Backend API!"}
