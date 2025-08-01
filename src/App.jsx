
import React, { useEffect, useRef } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, push, set, remove } from "firebase/database";
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import '@fullcalendar/core/index.css';
import '@fullcalendar/timegrid/index.css';

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

  useEffect(() => {
    const calendarEl = calendarRef.current;
    const calendar = new Calendar(calendarEl, {
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
        const nom = prompt("Nom du client:");
        const def = prompt("Défectuosités:");
        if (nom) {
          const newEventRef = push(ref(db, 'rendezvous'));
          set(newEventRef, {
            title: nom + " - " + def,
            start: info.dateStr
          });
        }
      },
      eventDrop: function(info) {
        const eventRef = ref(db, 'rendezvous/' + info.event.id);
        set(eventRef, {
          title: info.event.title,
          start: info.event.start.toISOString()
        });
      },
      eventClick: function(info) {
        if (confirm("Supprimer ce rendez-vous ?")) {
          const eventRef = ref(db, 'rendezvous/' + info.event.id);
          remove(eventRef);
          info.event.remove();
        }
      },
      events: []
    });

    const calendarDbRef = ref(db, 'rendezvous');
    onValue(calendarDbRef, (snapshot) => {
      const data = snapshot.val();
      calendar.removeAllEvents();
      for (let id in data) {
        calendar.addEvent({
          id,
          title: data[id].title,
          start: data[id].start
        });
      }
    });

    calendar.render();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#b70000", fontWeight: "bold" }}>Calendrier de rendez-vous</h1>
      <div ref={calendarRef}></div>
    </div>
  );
}
