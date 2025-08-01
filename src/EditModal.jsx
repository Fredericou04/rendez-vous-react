
import React, { useState } from 'react';

export default function EditModal({ data, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState(data.title || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [def, setDef] = useState(data.def || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...data, title, phone, def });
  };

  return (
    <div style={modalStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2>{data.id ? "Modifier" : "Nouveau"} rendez-vous</h2>
        <label>Nom du client :</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Numéro de téléphone :</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <label>Défectuosités :</label>
        <textarea value={def} onChange={(e) => setDef(e.target.value)} />
        <div style={{ marginTop: "10px" }}>
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={onCancel} style={{ marginLeft: "10px" }}>Annuler</button>
          {data.id && (
            <button type="button" onClick={() => onDelete(data.id)} style={{ marginLeft: "10px", color: "red" }}>Supprimer</button>
          )}
        </div>
      </form>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const formStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "300px"
};
