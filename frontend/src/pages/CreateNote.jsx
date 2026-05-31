import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function CreateNote() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      if (!text.trim()) {
        alert("Please enter some text");
        return;
      }

      const res = await axios.post(
        `${API_URL}/api/notes/create`,
        {
          text,
        }
      );

      navigate(`/note/${res.data._id}`);
    } catch (err) {
      console.error("Create note error:", err);
      alert("Failed to create note");
    }
  };

  const handleUpload = async () => {
    try {
      if (!file) {
        alert("Please select a file");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        `${API_URL}/api/notes/upload-pdf`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate(`/note/${res.data.note._id}`);
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to upload PDF"
      );
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Create Note</h2>

      <textarea
        rows="10"
        placeholder="Paste your notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{
          width: "100%",
          marginBottom: "20px",
        }}
      />

      <button onClick={handleCreate}>
        Create From Text
      </button>

      <hr style={{ margin: "30px 0" }} />

      <input
        type="file"
        accept=".pdf,image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleUpload}>
        Upload PDF
      </button>
    </div>
  );
}

export default CreateNote;