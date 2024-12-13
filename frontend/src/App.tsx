import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  // State variables
  const [file, setFile] = useState<File | null>(null); // For file uploads
  const [filename, setFilename] = useState(""); // Filename returned by the server
  const [tags, setTags] = useState(""); // Tags for organization
  const [category, setCategory] = useState(""); // Category for organization
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [searchResults, setSearchResults] = useState<any[]>([]); // Search results
  const [startDate, setStartDate] = useState(""); // Start date for search
  const [endDate, setEndDate] = useState(""); // End date for search
  const [question, setQuestion] = useState(""); // User's input question
  const [answer, setAnswer] = useState(""); // Answer returned by the backend

  // File upload handler
  const handleFileUpload = async () => {
    if (!file) {
      alert("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("tags", tags); // Include tags
    formData.append("category", category); // Include category

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

  // Question submission handler
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

  // File search handler
  const handleSearchFiles = async () => {
    try {
      const response = await axios.get("http://localhost:8000/search/", {
        params: {
          query: searchQuery,
          start_date: startDate,
          end_date: endDate,
          category: category,
        },
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Search failed!");
    }
  };

  // File delete handler
  const handleDeleteFile = async (fileId: number) => {
    try {
      await axios.delete(`http://localhost:8000/delete/${fileId}/`);
      alert("File deleted successfully!");
      // Refresh search results
      handleSearchFiles();
    } catch (error) {
      console.error("Error while deleting file:", error);
      alert("Error while deleting file!");
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>PDF Q&A Application</h1>
      </header>

      {/* File Upload Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Upload PDF</h2>
        <div style={styles.inputContainer}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            style={styles.fileInput}
          />
          <input
            type="text"
            placeholder="Enter tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={styles.textInput}
          />
          <input
            type="text"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.textInput}
          />
          <button onClick={handleFileUpload} style={styles.button}>
            Upload
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Search Files</h2>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Search by name or tags"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.textInput}
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={styles.textInput}
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={styles.textInput}
          />
          <input
            type="text"
            placeholder="Enter category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={styles.textInput}
          />
          <button onClick={handleSearchFiles} style={styles.button}>
            Search
          </button>
        </div>
        {/* Display search results */}
        <ul style={styles.fileList}>
          {searchResults.map((file) => (
            <li key={file.id} style={styles.fileItem}>
              <strong>{file.filename}</strong> - Tags: {file.tags || "None"} - Category: {file.category || "None"}
              <button
                onClick={() => handleDeleteFile(file.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Question Submission Section */}
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
    maxWidth: "800px",
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
    flexWrap: "wrap" as const,
  },
  textInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontSize: "14px",
  },
  fileInput: {
    flex: 1,
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
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
  },
  deleteButton: {
    marginLeft: "10px",
    backgroundColor: "#FF4D4D",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "5px 10px",
    cursor: "pointer",
  },
  fileList: {
    listStyleType: "none",
    padding: "0",
  },
  fileItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "#f1f1f1",
    borderRadius: "5px",
    marginBottom: "10px",
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
