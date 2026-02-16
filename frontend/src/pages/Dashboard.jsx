import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await API.get("/notes");
    setNotes(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>📘 Your Notes</h2>

      {notes.map((note) => (
        <div
          key={note._id}
          style={{
            border: "1px solid #ddd",
            padding: 10,
            marginBottom: 10,
            cursor: "pointer",
          }}
          onClick={() => navigate(`/note/${note._id}`)}
        >
          {note.text.slice(0, 120)}...
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
