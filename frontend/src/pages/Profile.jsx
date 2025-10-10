import { useState } from "react";

function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");

  async function handleSave(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/users/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) alert("Данные обновлены");
    else alert("Ошибка сохранения");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Личный кабинет</h2>
      <form onSubmit={handleSave}>
        <input
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button style={{ marginLeft: "10px" }} type="submit">
          Сохранить
        </button>
      </form>
      <button
        style={{ marginTop: "10px" }}
        onClick={() => (window.location.href = "/dashboard")}
      >
        Назад
      </button>
    </div>
  );
}

export default Profile;
