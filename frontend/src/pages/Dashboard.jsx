import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ru from "date-fns/locale/ru";

const locales = { ru: ru };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function Dashboard() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [userId, setUserId] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchShifts();
  }, []);

  async function fetchShifts() {
    const res = await fetch("http://localhost:4000/api/shifts", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setShifts(data);
  }

  async function createShift(e) {
    e.preventDefault();

    if (!date || !start || !end) {
      alert("Заполните дату, начало и конец смены");
      return;
    }

    const body = {
      user_id: userId || undefined,
      shift_date: date,
      start_time: start,
      end_time: end,
    };
    const res = await fetch("http://localhost:4000/api/shifts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setDate("");
      setStart("");
      setEnd("");
      setUserId("");
      fetchShifts();
    } else {
      const err = await res.json();
      alert(err.error || "Ошибка создания");
    }
  }

  const events = useMemo(
    () =>
      shifts
        .filter((s) => s.shift_date && s.start_time && s.end_time)
        .map((s) => {
          const startISO = `${s.shift_date}T${
            s.start_time.length === 5 ? s.start_time + ":00" : s.start_time
          }`;
          const endISO = `${s.shift_date}T${
            s.end_time.length === 5 ? s.end_time + ":00" : s.end_time
          }`;
          return {
            id: s.id,
            title: s.user_name || "Смена",
            start: new Date(startISO),
            end: new Date(endISO),
            resource: s,
          };
        }),
    [shifts]
  );

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Shifts Calendar</h2>
        <div>
          <span style={{ marginRight: 10 }}>{user?.username}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={{ height: 600, marginTop: 10 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={["month", "week", "day"]}
          style={{ height: "100%" }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Create shift</h3>
        <form
          style={{ display: "flex", justifyContent: "center" }}
          onSubmit={createShift}
        >
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{ marginRight: 10 }}
            required
          />
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
          />
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={{ marginRight: 10 }}
            required
          />
          {/* Только для админа: можно указать user_id; для простоты оставим как текст */}
          <input
            placeholder="user_id (только для admin)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{ marginRight: 10 }}
          />
          <button type="submit">Add</button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
