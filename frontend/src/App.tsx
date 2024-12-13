import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  // State variables to manage file, filename, user question, and answer
  const [file, setFile] = useState<File | null>(null); // Stores the uploaded file
  const [filename, setFilename] = useState(""); // Stores the filename returned by the server
  const [question, setQuestion] = useState(""); // Stores the user's input question
  const [answer, setAnswer] = useState(""); // Stores the answer from the backend

  // Function to handle file upload
  const handleFileUpload = async () => {
    // Check if a file is selected
    if (!file) {
      alert("Please select a file.");
      return;
    }

    // Prepare the form data with the uploaded file
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Send POST request to the backend to upload the file
      const response = await axios.post("http://localhost:8000/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // Ensures proper handling of file uploads
        },
      });
      // Store the filename returned by the server
      setFilename(response.data.filename);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed!");
    }
  };

  // Function to handle question submission
  const handleAskQuestion = async () => {
    // Ensure a file has been uploaded
    if (!filename) {
      alert("Please upload a file first.");
      return;
    }

    // Prepare form data with the filename and question
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("question", question);

    try {
      // Send POST request to the backend with the question
      const response = await axios.post("http://localhost:8000/ask/", formData);
      // Store the answer returned by the backend
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error while asking question:", error);
      alert("Error while asking question!");
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <header style={styles.header}>
        <h1 style={styles.title}>PDF Q&A Application</h1>
      </header>

      {/* File Upload Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Upload PDF</h2>
        <div style={styles.inputContainer}>
          {/* Input for selecting a PDF file */}
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
          {/* Button to upload the selected file */}
          <button onClick={handleFileUpload} style={styles.button}>
            Upload
          </button>
        </div>
      </div>

      {/* Question Submission Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Ask a Question</h2>
        <div style={styles.inputContainer}>
          {/* Input for typing a question */}
          <input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={styles.textInput}
          />
          {/* Button to submit the question */}
          <button onClick={handleAskQuestion} style={styles.button}>
            Ask
          </button>
        </div>
      </div>

      {/* Display Answer Section */}
      {answer && (
        <div style={styles.answerSection}>
          <h2 style={styles.sectionTitle}>Answer</h2>
          <p style={styles.answerText}>{answer}</p>
        </div>
      )}
    </div>
  );
};

// Styles for the application
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "20px",
  },
  title: {
    fontSize: "24px",
    color: "#333",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    color: "#555",
    marginBottom: "10px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  fileInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
  },
  textInput: {
    flex: 1,
    padding: "8px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    fontSize: "14px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold" as const,
    transition: "background-color 0.3s",
  },
  answerSection: {
    marginTop: "20px",
    padding: "15px",
    backgroundColor: "#e6f7e6",
    borderRadius: "5px",
    border: "1px solid #b2d8b2",
  },
  answerText: {
    fontSize: "16px",
    color: "#333",
  },
};

export default App;
