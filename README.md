
# PDF Q&A Application

## Overview

A simple web application that allows users to:
1. Upload a PDF file.
2. Ask questions related to its content.
3. Receive answers using AI-powered natural language processing.

## Features

- Upload PDF files for processing.
- Ask questions and get intelligent answers.
- Simple, clean, and responsive UI.

## Technologies Used

- **Frontend**: React.js (TypeScript)
- **Backend**: FastAPI
- **NLP Tools**: LangChain, FAISS
- **Database**: SQLite

## Setup Instructions

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies and start the server:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies and start the development server:
   ```bash
   npm install
   npm start
   ```

## Usage

1. **Upload a PDF**: Select and upload a PDF file.
2. **Ask a Question**: Type a question related to the uploaded PDF.
3. **View Answer**: Get the AI-generated answer displayed on the screen.

 ## Demo

[Watch the Demo Video](./media/demo.mp4)


## Future Improvements

- Support for additional document types.
- User authentication for personalized document storage.
- Cloud deployment for scalability.

---
