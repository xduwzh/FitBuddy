import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { useNavigate } from "react-router-dom";
import { register } from "../store/slices/authSlice";

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector((s) => s.auth.status);
  const error = useAppSelector((s) => s.auth.error);
  const user = useAppSelector((s) => s.auth.user);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  return (
    <div
      className="app-container"
      style={{
        maxWidth: 480,
        minHeight: 600,
        margin: "10vh auto",
        background: "rgba(255,255,255,0.95)",
        borderRadius: 20,
        padding: "2rem",
        boxShadow: "0 0 30px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        className="header"
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          borderRadius: 16,
          padding: "1rem 1.5rem",
          color: "#fff",
          marginBottom: "1.5rem",
        }}
      >
        <h1
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
        >
          <span role="img" aria-label="dumbbell">
            🏋️
          </span>{" "}
          FitBuddy
        </h1>
      </header>

      <h2 style={{ color: "#4facfe", marginBottom: "1rem" }}>Create Account</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "0.8rem",
            border: "2px solid #e0e0e0",
            borderRadius: 10,
            fontSize: "1rem",
          }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "0.8rem",
            border: "2px solid #e0e0e0",
            borderRadius: 10,
            fontSize: "1rem",
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "0.8rem",
            border: "2px solid #e0e0e0",
            borderRadius: 10,
            fontSize: "1rem",
          }}
        />

        <button
          onClick={() => dispatch(register({ username, email, password }))}
          disabled={status === "loading" || !email || !password || !username}
          style={{
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            color: "#fff",
            padding: "0.9rem 1rem",
            borderRadius: 25,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          {status === "loading" ? "Registering..." : "Register"}
        </button>

        {error && <div style={{ color: "#dc3545" }}>{error}</div>}

        <div style={{ textAlign: "center", color: "#666" }}>
          Already have an account?
        </div>

        <button
          onClick={() => navigate("/login")}
          style={{
            background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
            color: "#fff",
            padding: "0.9rem 1rem",
            borderRadius: 25,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}
