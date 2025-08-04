import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import EditModal from './EditModal';

const firebaseConfig = {
  apiKey: "AIzaSyDvfyCos6aOrRkKdFMs46AwmA4wloPLim8",
  authDomain: "rendez-vous-c424e.firebaseapp.com",
  databaseURL: "https://rendez-vous-c424e-default-rtdb.firebaseio.com",
  projectId: "rendez-vous-c424e",
  storageBucket: "rendez-vous-c424e.appspot.com",
  messagingSenderId: "709533349666",
  appId: "1:709533349666:web:8a8c7d76956302e75ed77b"
};

initializeApp(firebaseConfig);
const db = getDatabase();

export default function App() {
  const calendarRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [showWeekends, setShowWeekends] = useState(true);
  const [activeDept, setActiveDept] = useState("mecanique");

  const getDbPath = () => activeDept === "mecanique" ? "rendezvous_mecanique" : "rendezvous_inspection";

  useEffect(() => {
    if (!calendarRef.current) return;
    renderCalendar();
  }, [activeDept]);

  const renderCalendar = () => {
    const calendarEl = calendarRef.current;
    if (calendar) {
      calendar.destroy();
    }

    const cal = new Calendar(calendarEl, {
      plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
      initialView: 'timeGridDay',
      editable: true,
      selectable: true,
      locale: frLocale,
      slotMinTime: "07:00:00",
      slotMaxTime: "22:00:00",
      weekends: showWeekends,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },
      dateClick: function(info) {
        if (calendar.view.type === "dayGridMonth") {
          calendar.changeView('timeGridDay', info.dateStr);
          return;
        }

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
      eventClick: function(info) {
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
      eventDrop: function(info) {
        const [nom, phone, def] = info.event.title.split(" | ");
        const eventRef = ref(db, getDbPath() + '/' + info.event.id);
        set(eventRef, {
          title: nom + " | " + phone + " | " + def,
          start: info.event.startStr,
          allDay: info.event.allDay || false,
          draggable: info.event.extendedProps.draggable ?? false
        });
      },
      eventDidMount: function(info) {
        if (info.event.allDay) {
          info.el.style.backgroundColor = "#fff6cc";
          info.el.style.border = "1px solid #e6d400";
          info.el.style.color = "#000";
        }
        if (!info.event.extendedProps.draggable && !info.event.allDay) {
          info.el.draggable = false;
        }
      },
      eventAllow: function(dropInfo, draggedEvent) {
        return draggedEvent.extendedProps.draggable ?? false;
      },
      events: []
    });
    setCalendar(cal);

    const calendarDbRef = ref(db, getDbPath());
    onValue(calendarDbRef, (snapshot) => {
      const data = snapshot.val();
      cal.removeAllEvents();
      for (let id in data) {
        cal.addEvent({
          id,
          title: data[id].title,
          start: data[id].start,
          allDay: data[id].allDay || false,
          extendedProps: {
            draggable: data[id].draggable ?? false
          }
        });
      }
    });

    cal.render();
  };

  const toggleWeekends = () => {
    if (calendar) {
      calendar.setOption("weekends", !showWeekends);
      setShowWeekends(!showWeekends);
    }
  };

  const handleSave = (data) => {
    const fullTitle = data.title + " | " + data.phone + " | " + data.def;
    const dbPath = getDbPath();

    const record = {
      title: fullTitle,
      start: data.start,
      allDay: data.allDay || false,
      draggable: data.draggable ?? false
    };

    if (data.id) {
      const eventRef = ref(db, dbPath + '/' + data.id);
      set(eventRef, record);
    } else {
      const newEventRef = push(ref(db, dbPath));
      set(newEventRef, record);
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce rendez-vous ?")) {
      const eventRef = ref(db, getDbPath() + '/' + id);
      remove(eventRef);
      setModalOpen(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#b70000", fontWeight: "bold" }}>Calendrier de rendez-vous</h1>
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setActiveDept("mecanique")} disabled={activeDept === "mecanique"}>
          Département Mécanique
        </button>
        <button onClick={() => setActiveDept("inspection")} disabled={activeDept === "inspection"} style={{ marginLeft: "10px" }}>
          Département Inspection
        </button>
        <button onClick={toggleWeekends} style={{ marginLeft: "10px" }}>
          {showWeekends ? "Masquer le samedi/dimanche" : "Afficher le samedi/dimanche"}
        </button>
      </div>
      <div ref={calendarRef}></div>
      {modalOpen && (
        <EditModal
          data={eventData}
          onSave={handleSave}
          onCancel={() => setModalOpen(false)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
