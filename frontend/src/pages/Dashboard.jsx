import React, { useEffect, useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import ru from "date-fns/locale/ru";
import Modal from "react-modal";

const locales = { "ru-RU": ru };
const localizer = dateFnsLocalizer({
  formats: {
    dateFormat: "d",
    dayFormat: "eeeeee",
    weekdayFormat: "eeee",
    monthHeaderFormat: "LLLL yyyy",
    dayHeaderFormat: "dd MMMM yyyy",
    dayRangeHeaderFormat: ({ start, end }) =>
      `${format(start, "d LLLL", { locale: ru })} — ${format(
        end,
        "d LLLL yyyy",
        { locale: ru }
      )}`,
    agendaHeaderFormat: ({ start, end }) =>
      `${format(start, "d LLLL", { locale: ru })} — ${format(
        end,
        "d LLLL yyyy",
        { locale: ru }
      )}`,
  },
  format: (date, formatStr) => format(date, formatStr, { locale: ru }),
  parse: (value, formatStr) =>
    parse(value, formatStr, new Date(), { locale: ru }),
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});
const messages = {
  date: "Дата",
  time: "Время",
  event: "Смена",
  allDay: "Весь день",
  week: "Неделя",
  work_week: "Рабочая неделя",
  day: "День",
  month: "Месяц",
  previous: "‹",
  next: "›",
  yesterday: "Вчера",
  tomorrow: "Завтра",
  today: "Сегодня",
  agenda: "Повестка",
  noEventsInRange: "Нет смен в выбранный период.",
};

Modal.setAppElement("#root");

function Dashboard() {
  const [shifts, setShifts] = useState([]);
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [username, setUsername] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editShift, setEditShift] = useState(null);

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

    if (!username || !date || !start || !end) {
      alert("Заполните сотрудника, дату, начало и конец смены");
      return;
    }

    const body = {
      username: username,
      shift_date: date,
      start_time: start,
      end_time: end,
    };
    console.log(body);
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

  async function updateShift(e) {
    e.preventDefault();
    const { username, date, start, end, id } = editShift;

    if (!username || !date || !start || !end) {
      alert("Заполните сотрудника, дату, начало и конец смены");
      return;
    }

    const body = {
      username,
      shift_date: date,
      start_time: start,
      end_time: end,
    };

    const res = await fetch(`http://localhost:4000/api/shifts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      fetchShifts();
      setEditShift(null);
    } else {
      const err = await res.json();
      alert(err.error || "Ошибка редактирования");
    }
  }

  function onSelectEvent(shift) {
    if (user?.role !== "admin") return;
    setEditShift({
      id: shift.id,
      username: shift.resource.username || "",
      date: format(shift.start, "yyyy-MM-dd"),
      start: format(shift.start, "HH:mm"),
      end: format(shift.end, "HH:mm"),
      note: shift.resource.note || "",
    });
    setIsModalOpen(true);
  }

  async function deleteShift() {
    await fetch(`http://localhost:4000/api/shifts/${editShift.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setIsModalOpen(false);
    setEditShift(null);
    fetchShifts();
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
            title: s.username || "Смена",
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
          <span>{user?.username}</span>
          <button onClick={() => (window.location.href = "/profile")}>
            Личный кабинет
          </button>
          <button onClick={logout}>Выйти</button>
        </div>
      </div>

      <div
        style={{
          height: "calc(100vh - 200px)", // вся высота окна, минус хедер и отступы
          width: "100%",
          padding: "10px",
          background: "white",
          borderRadius: "10px",
          boxShadow: "0 0 10px rgba(0,0,0,0.05)",
        }}
      >
        <Calendar
          localizer={localizer}
          messages={messages}
          events={events}
          selectable={user?.role === "admin"}
          onSelectEvent={onSelectEvent}
          onSelectSlot={(slotInfo) => {
            if (user?.role !== "admin") return;
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
          views={["month", "week", "day"]}
          style={{ height: "100%" }}
        />
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setEditShift(null);
        }}
        contentLabel={editShift ? "Редактирование смены" : "Создание смены"}
        style={{
          content: {
            width: "400px",
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
        <h3>{editShift ? "Редактировать смену" : "Создать смену"}</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (editShift) {
              await updateShift(e);
            } else {
              await createShift(e);
            }
            setIsModalOpen(false);
            setEditShift(null);
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <input
              type="date"
              value={editShift ? editShift.date : date}
              onChange={(e) =>
                editShift
                  ? setEditShift({ ...editShift, date: e.target.value })
                  : setDate(e.target.value)
              }
              required
              style={{ marginRight: "32px" }}
            />
            <div style={{ display: "flex" }}>
              <input
                type="time"
                value={editShift ? editShift.start : start}
                onChange={(e) =>
                  editShift
                    ? setEditShift({ ...editShift, start: e.target.value })
                    : setStart(e.target.value)
                }
                required
              />
              <p style={{ fontSize: "9px" }}>_</p>
              <input
                type="time"
                value={editShift ? editShift.end : end}
                onChange={(e) =>
                  editShift
                    ? setEditShift({ ...editShift, end: e.target.value })
                    : setEnd(e.target.value)
                }
                required
              />
            </div>
            <label
              style={{
                display: "flex",
                justifyContent: "end",
                alignItems: "center",
                width: "100%",
              }}
            >
              Сотрудник:
              <input
                style={{ marginLeft: "6px" }}
                type="text"
                placeholder="Иван Иванов"
                value={editShift ? editShift.username : username}
                onChange={(e) =>
                  editShift
                    ? setEditShift({ ...editShift, username: e.target.value })
                    : setUsername(e.target.value)
                }
              />
            </label>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <button type="submit">
                {editShift ? "Обновить" : "Создать"}
              </button>
              {editShift && (
                <button
                  type="button"
                  style={{ background: "red", color: "white" }}
                  onClick={deleteShift}
                >
                  Удалить
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditShift(null);
                }}
              >
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
