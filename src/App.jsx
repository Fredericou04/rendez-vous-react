// (début du fichier App.jsx - imports et configuration inchangés)

import './App.css'; // on ajoute un fichier CSS pour les couleurs

...

// Dans render() ou useEffect (selon la structure du projet)

eventClick: function(info) {
  const currentView = calendar?.view?.type;

  // ❌ Ne pas ouvrir de modal en vue du mois
  if (currentView === "dayGridMonth") return;

  // ✅ En jour/semaine : ouvrir le modal
  const [nom, phone, def] = info.event.title.split(" | ");
  setEventData({
    id: info.event.id,
    start: info.event.startStr,
    title: nom || "",
    phone: phone || "",
    def: def || "",
    allDay: info.event.allDay,
    draggable: info.event.extendedProps.draggable ?? false
  });
  setModalOpen(true);
},

eventDidMount: function(info) {
  // Appliquer un style CSS custom uniquement aux allDay (notes)
  if (info.event.allDay) {
    info.el.classList.add("note-jour");
  }

  // Masquer les événements non-allDay en vue du mois
  if (calendar?.view?.type === "dayGridMonth" && !info.event.allDay) {
    info.el.style.display = "none";
  }
},

dateClick: function(info) {
  const viewType = calendar?.view?.type;

  // En vue du mois → changer de vue
  if (viewType === "dayGridMonth") {
    calendar.changeView('timeGridDay', info.dateStr);
    return;
  }

  // En vue jour/semaine → ouvrir le modal
  const isAllDayClick = info.allDay || info.jsEvent?.target?.closest('.fc-daygrid-day-frame');
  setEventData({
    id: null,
    start: info.dateStr,
    title: "",
    phone: "",
    def: "",
    allDay: isAllDayClick,
    draggable: false
  });
  setModalOpen(true);
},
