import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ru from "date-fns/locale/ru";
import Modal from "react-modal";

const locales = { ru: ru };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

Modal.setAppElement("#root");

function Dashboard() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      username: username || undefined,
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
      setUsername("");
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
        <h2>Календарь смен</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <span
            style={{
              marginRight: 10,
              cursor: "pointer",
              textDecoration: "underline",
            }}
            onClick={() => (window.location.href = "/profile")}
          >
            {user?.username}
          </span>
          <button onClick={logout}>Выйти</button>
        </div>
      </div>

      <div style={{ height: 600, width: 1000, marginTop: 10 }}>
        <Calendar
          localizer={localizer}
          events={events}
          selectable
          onSelectSlot={(slotInfo) => {
            const dateStr = format(slotInfo.start, "yyyy-MM-dd");
            const startTime = format(slotInfo.start, "HH:mm");
            const endTime = format(slotInfo.end, "HH:mm");
            setDate(dateStr);
            setStart(startTime);
            setEnd(endTime);
            setIsModalOpen(true);
          }}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={["week", "day"]}
          style={{ height: "100%" }}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Создание смены"
        style={{
          content: {
            width: "300px",
            margin: "auto",
            marginTop: "400px",
            height: "200px",
            borderRadius: "10px",
            padding: "20px",
            paddingTop: "0px",
            background: "white",
          },
        }}
      >
        <h3>Создать смену</h3>
        <form
          onSubmit={async (e) => {
            await createShift(e);
            setIsModalOpen(false);
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ marginRight: "32px" }}
            />
            <input
              type="time"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
            />
            <p style={{ fontSize: "9px" }}>_</p>
            <input
              type="time"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
            {user?.role === "admin" && (
              <label>
                Пользователь:
                <input
                  style={{ marginLeft: "6px" }}
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </label>
            )}
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <button type="submit">Создать</button>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Dashboard;
