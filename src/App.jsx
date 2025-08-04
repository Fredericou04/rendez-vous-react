import React, { useState, useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import frLocale from "@fullcalendar/core/locales/fr";
import { getDatabase, ref, onValue, set, remove } from "firebase/database";
import Modal from "./Modal";
import { initializeApp } from "firebase/app";
import "./App.css";

const firebaseConfig = {
  apiKey: "AIzaSyDvfyCos6aOrRkKdFMs46AwmA4wloPLim8",
  authDomain: "rendez-vous-c424e.firebaseapp.com",
  databaseURL: "https://rendez-vous-c424e-default-rtdb.firebaseio.com",
  projectId: "rendez-vous-c424e",
  storageBucket: "rendez-vous-c424e.appspot.com",
  messagingSenderId: "709533349666",
  appId: "1:709533349666:web:8a8c7d76956302e75ed77b"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function App() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventData, setEventData] = useState({});
  const [currentDept, setCurrentDept] = useState("mecanique");
  const calendarRef = useRef(null);

  useEffect(() => {
    const dbRef = ref(db, currentDept === "mecanique" ? "rendezvous" : "inspection");
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      const loaded = [];
      for (let id in data) {
        const evt = data[id];
        loaded.push({
          id,
          title: evt.title,
          start: evt.start,
          allDay: evt.allDay || false,
          extendedProps: {
            draggable: evt.draggable || false
          }
        });
      }
      setEvents(loaded);
    });
  }, [currentDept]);

  const handleDateClick = (info) => {
    const view = calendarRef.current.getApi().view.type;
    const isAllDayClick = info.allDay || info.jsEvent?.target?.closest(".fc-daygrid-day-frame");
    if (view === "dayGridMonth") {
      calendarRef.current.getApi().changeView("timeGridDay", info.dateStr);
      return;
    }
    if (view === "timeGridDay" || view === "timeGridWeek") {
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
    }
  };

  const handleEventClick = (info) => {
    const view = calendarRef.current.getApi().view.type;
    if (view === "dayGridMonth") return;
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
  };

  const handleSave = (data) => {
    const fullTitle = `${data.title} | ${data.phone} | ${data.def}`;
    const dbRef = ref(db, (currentDept === "mecanique" ? "rendezvous/" : "inspection/") + (data.id || Date.now()));
    set(dbRef, {
      title: fullTitle,
      start: data.start,
      allDay: data.allDay || false,
      draggable: data.draggable || false
    });
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const dbRef = ref(db, (currentDept === "mecanique" ? "rendezvous/" : "inspection/") + id);
    remove(dbRef);
    setModalOpen(false);
  };

  return (
    <div className="App">
      <div style={{ padding: "10px", display: "flex", gap: "10px" }}>
        <button onClick={() => setCurrentDept("mecanique")}>Calendrier Mécanique</button>
        <button onClick={() => setCurrentDept("inspection")}>Calendrier Inspection</button>
      </div>
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locales={[frLocale]}
        locale="fr"
        allDaySlot={true}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        selectable={true}
        editable={true}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDidMount={(info) => {
          if (info.event.allDay) {
            info.el.classList.add("note-jour");
            info.el.style.color = "black";
          }
          if (
            calendarRef.current.getApi().view.type === "dayGridMonth" &&
            !info.event.allDay
          ) {
            info.el.style.display = "none";
          }
        }}
      />
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
        eventData={eventData}
      />
    </div>
  );
}

export default App;
