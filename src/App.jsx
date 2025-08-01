
import React, { useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
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

  useEffect(() => {
    const calendarEl = calendarRef.current;
    const cal = new Calendar(calendarEl, {
      plugins: [timeGridPlugin, interactionPlugin],
      initialView: 'timeGridDay',
      editable: true,
      selectable: true,
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'timeGridDay,timeGridWeek'
      },
      dateClick: function(info) {
        setEventData({ id: null, start: info.dateStr, title: "", phone: "", def: "" });
        setModalOpen(true);
      },
      eventClick: function(info) {
        const [nom, phone, def] = info.event.title.split(" | ");
        setEventData({
          id: info.event.id,
          start: info.event.start.toISOString(),
          title: nom || "",
          phone: phone || "",
          def: def || ""
        });
        setModalOpen(true);
      },
      eventDrop: function(info) {
        const [nom, phone, def] = info.event.title.split(" | ");
        const eventRef = ref(db, 'rendezvous/' + info.event.id);
        set(eventRef, {
          title: nom + " | " + phone + " | " + def,
          start: info.event.start.toISOString()
        });
      },
      events: []
    });
    setCalendar(cal);

    const calendarDbRef = ref(db, 'rendezvous');
    onValue(calendarDbRef, (snapshot) => {
      const data = snapshot.val();
      cal.removeAllEvents();
      for (let id in data) {
        cal.addEvent({
          id,
          title: data[id].title,
          start: data[id].start
        });
      }
    });

    cal.render();
  }, []);

  const handleSave = (data) => {
    const fullTitle = data.title + " | " + data.phone + " | " + data.def;
    if (data.id) {
      const eventRef = ref(db, 'rendezvous/' + data.id);
      set(eventRef, {
        title: fullTitle,
        start: data.start
      });
    } else {
      const newEventRef = push(ref(db, 'rendezvous'));
      set(newEventRef, {
        title: fullTitle,
        start: data.start
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Supprimer ce rendez-vous ?")) {
      const eventRef = ref(db, 'rendezvous/' + id);
      remove(eventRef);
      setModalOpen(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#b70000", fontWeight: "bold" }}>Calendrier de rendez-vous</h1>
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
