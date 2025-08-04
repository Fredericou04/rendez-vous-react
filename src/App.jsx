import React, { useState, useEffect, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  onValue,
  set,
  remove,
} from "firebase/database";
import Modal from "./Modal";
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
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventData, setEventData] = useState({
    id: null,
    start: "",
    title: "",
    phone: "",
    def: "",
    allDay: false,
    draggable: false
  });

  useEffect(() => {
    const eventsRef = ref(db, "rendezvous");
    onValue(eventsRef, (snapshot) => {
      const data = snapshot.val();
      const loadedEvents = [];
      for (let id in data) {
        const [nom, phone, def] = data[id].title.split(" | ");
        loadedEvents.push({
          id,
          title: data[id].title,
          start: data[id].start,
          allDay: data[id].allDay || false,
          extendedProps: {
            draggable: data[id].draggable ?? false,
            nom,
            phone,
            def
          }
        });
      }
      setEvents(loadedEvents);
    });
  }, []);

  const handleDateClick = (info) => {
    const calendarApi = calendarRef.current?.getApi();
    const viewType = calendarApi.view.type;

    if (viewType === "dayGridMonth") {
      calendarApi.changeView("timeGridDay", info.dateStr);
      return;
    }

    const isAllDayClick =
      info.allDay || info.jsEvent?.target?.closest(".fc-daygrid-day-frame");
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
  };

  const handleEventClick = (info) => {
    const calendarApi = calendarRef.current?.getApi();
    const viewType = calendarApi.view.type;

    if (viewType === "dayGridMonth") return;

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

  const handleEventDrop = (info) => {
    const [nom, phone, def] = info.event.title.split(" | ");
    if (info.event.extendedProps.draggable) {
      const eventRef = ref(db, "rendezvous/" + info.event.id);
      set(eventRef, {
        title: info.event.title,
        start: info.event.start.toISOString(),
        allDay: info.event.allDay,
        draggable: true
      });
    } else {
      info.revert();
    }
  };

  const handleSave = (data) => {
    const fullTitle = `${data.title} | ${data.phone} | ${data.def}`;
    if (data.id) {
      const eventRef = ref(db, "rendezvous/" + data.id);
      set(eventRef, {
        title: fullTitle,
        start: data.start,
        allDay: data.allDay,
        draggable: data.draggable
      });
    } else {
      const newEventRef = ref(db, "rendezvous/" + Date.now());
      set(newEventRef, {
        title: fullTitle,
        start: data.start,
        allDay: data.allDay,
        draggable: data.draggable
      });
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    const eventRef = ref(db, "rendezvous/" + id);
    remove(eventRef);
    setModalOpen(false);
  };

  return (
    <div className="App">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        editable={true}
        droppable={true}
        selectable={true}
        events={events}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        dateClick={handleDateClick}
        eventDidMount={(info) => {
          if (info.event.allDay) {
            info.el.classList.add("note-jour");
          }
          const calendarApi = calendarRef.current?.getApi();
          if (
            calendarApi.view.type === "dayGridMonth" &&
            !info.event.allDay
          ) {
            info.el.style.display = "none";
          }
        }}
        locale="fr"
        firstDay={1}
        allDaySlot={true}
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
