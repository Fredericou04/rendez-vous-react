import React, { useState, useEffect } from "react";
import "./Modal.css";

function Modal({ isOpen, onClose, onSave, onDelete, eventData }) {
  const [title, setTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [def, setDef] = useState("");
  const [draggable, setDraggable] = useState(false);

  useEffect(() => {
    if (eventData) {
      setTitle(eventData.title || "");
      setPhone(eventData.phone || "");
      setDef(eventData.def || "");
      setDraggable(eventData.draggable || false);
    }
  }, [eventData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onSave({
      ...eventData,
      title,
      phone,
      def,
      draggable
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{eventData.id ? "Modifier" : "Créer"} un rendez-vous</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom du client</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Numéro de téléphone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Facultatif" />

          <label>Défectuosité</label>
          <textarea value={def} onChange={(e) => setDef(e.target.value)} />

          <label>
            <input type="checkbox" checked={draggable} onChange={(e) => setDraggable(e.target.checked)} />
            Débloquer le déplacement du rendez-vous
          </label>

          <div className="modal-actions">
            <button type="submit">Enregistrer</button>
            {eventData.id && <button type="button" onClick={() => onDelete(eventData.id)}>Supprimer</button>}
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;
