import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setFilename(response.data.filename);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("File upload failed:", error);
      alert("File upload failed!");
    }
  };

  const handleAskQuestion = async () => {
    if (!filename) {
      alert("Please upload a file first.");
      return;
    }
    const formData = new FormData();
    formData.append("filename", filename);
    formData.append("question", question);

    try {
      const response = await axios.post("http://localhost:8000/ask/", formData);
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error while asking question:", error);
      alert("Error while asking question!");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>PDF Q&A Application</h1>
      </header>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Upload PDF</h2>
        <div style={styles.inputContainer}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
          <button onClick={handleFileUpload} style={styles.button}>
            Upload
          </button>
        </div>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Ask a Question</h2>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Enter your question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            style={styles.textInput}
          />
          <button onClick={handleAskQuestion} style={styles.button}>
            Ask
          </button>
        </div>
      </div>

      {answer && (
        <div style={styles.answerSection}>
          <h2 style={styles.sectionTitle}>Answer</h2>
          <p style={styles.answerText}>{answer}</p>
        </div>
      )}
    </div>
  );
};

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
  buttonHover: {
    backgroundColor: "#0056b3",
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
