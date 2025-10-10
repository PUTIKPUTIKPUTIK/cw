import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      nav("/dashboard");
    } else {
      alert(data.error || "Ошибка");
    }
  }

  return (
    <div style={{ padding: 20, margin: "0 auto", maxWidth: "300px" }}>
      <h2>Вход</h2>
      <form
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 10,
        }}
        onSubmit={submit}
      >
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
      <Link to="/register">Регистрация</Link>
    </div>
  );
}

export default Login;
