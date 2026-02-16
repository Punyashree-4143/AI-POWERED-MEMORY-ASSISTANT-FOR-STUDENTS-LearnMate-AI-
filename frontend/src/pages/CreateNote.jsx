import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateNote() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async () => {
    try {
      if (text.trim()) {
        const res = await axios.post("http://localhost:5000/api/notes/create", {
          text,
        });

        navigate(`/note/${res.data._id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post(
        "http://localhost:5000/api/notes/upload-pdf",
        formData
      );

      navigate(`/note/${res.data.note._id}`);
    } catch (err) {
      console.error(err);
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
        style={{ width: "100%", marginBottom: "20px" }}
      />

      <button onClick={handleCreate}>Create From Text</button>

      <hr style={{ margin: "30px 0" }} />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={handleUpload}>Upload PDF</button>
    </div>
  );
}

export default CreateNote;
