import React from "react";

function Modal({ isOpen, onClose, onSave, onDelete, eventData }) {
  if (!isOpen) return null;

  const [title, setTitle] = React.useState(eventData.title || "");
  const [phone, setPhone] = React.useState(eventData.phone || "");
  const [def, setDef] = React.useState(eventData.def || "");
  const [draggable, setDraggable] = React.useState(eventData.draggable || false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...eventData,
      title,
      phone,
      def,
      draggable
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{eventData.id ? "Modifier le rendez-vous" : "Nouveau rendez-vous"}</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom du client:</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />

          <label>Téléphone (optionnel):</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label>Défectuosité:</label>
          <textarea value={def} onChange={(e) => setDef(e.target.value)} />

          <label>
            <input
              type="checkbox"
              checked={draggable}
              onChange={(e) => setDraggable(e.target.checked)}
            />
            Débloquer le déplacement
          </label>

          <div className="buttons">
            <button type="submit">Enregistrer</button>
            {eventData.id && (
              <button type="button" onClick={() => onDelete(eventData.id)}>
                Supprimer
              </button>
            )}
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Modal;