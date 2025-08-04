import React, { useState, useEffect } from 'react';

export default function EditModal({ data, onSave, onCancel, onDelete }) {
  const [title, setTitle] = useState(data.title || "");
  const [phone, setPhone] = useState(data.phone || "");
  const [def, setDef] = useState(data.def || "");
  const [draggable, setDraggable] = useState(data.draggable ?? false);

  useEffect(() => {
    setTitle(data.title || "");
    setPhone(data.phone || "");
    setDef(data.def || "");
    setDraggable(data.draggable ?? false);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...data,
      title,
      phone,
      def,
      draggable
    });
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      justifyContent: "center", alignItems: "center", zIndex: 999
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: "white", padding: "20px", borderRadius: "10px", width: "300px"
      }}>
        <h3 style={{ marginTop: 0 }}>Modifier le rendez-vous</h3>
        <label>Nom du client</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        <label>Téléphone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        <label>Défectuosités</label>
        <textarea value={def} onChange={(e) => setDef(e.target.value)} />
        {!data.allDay && (
          <div style={{ marginTop: "10px" }}>
            <label>
              <input
                type="checkbox"
                checked={draggable}
                onChange={(e) => setDraggable(e.target.checked)}
              /> Débloquer le déplacement
            </label>
          </div>
        )}
        <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between" }}>
          <button type="submit">Enregistrer</button>
          <button type="button" onClick={() => onDelete(data.id)}>Supprimer</button>
          <button type="button" onClick={onCancel}>Annuler</button>
        </div>
      </form>
    </div>
  );
}
