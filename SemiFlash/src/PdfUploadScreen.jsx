import { useState, useRef } from "react";
import "./PdfUploadScreen.css";

function PdfUploadScreen() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // TODO: Send file to backend for processing
      // For now, show a placeholder message
      alert(`Processing ${file.name}... (Backend integration needed)`);

      // After successful processing, call onStart with parsed cards
      // const parsedCards = []; // TODO: Get from backend
      // onStart(parsedCards);
    } catch (err) {
      setError(err.message || "Failed to process PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pdf-upload-screen">
      <div className="upload-container">
        <h2>Upload PDF</h2>
        <p className="subtitle">
          Upload a PDF file to automatically extract questions
        </p>

        <div className="upload-zone">
          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}>
            <div className="upload-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M14 3.75v4.5a1.5 1.5 0 0 0 1.5 1.5H20"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M12 12.25v5m0 0-2-2m2 2 2-2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 3.75H8A3.25 3.25 0 0 0 4.75 7v10A3.25 3.25 0 0 0 8 20.25h8A3.25 3.25 0 0 0 19.25 17V9L14 3.75Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="upload-text">Click to select a PDF file</p>
            <p className="upload-hint">or drag and drop</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        {file && (
          <div className="file-info">
            <p className="file-name">✓ {file.name}</p>
            <p className="file-size">({(file.size / 1024).toFixed(2)} KB)</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button
          className="upload-button"
          onClick={handleUpload}
          disabled={!file || loading}>
          {loading ? "Processing..." : "Upload & Extract"}
        </button>
      </div>
    </div>
  );
}

export default PdfUploadScreen;
