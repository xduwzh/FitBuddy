import { useAppSelector } from "../store/hooks";

export default function AppHeader() {
  const user = useAppSelector((s) => s.auth.user);

  const username = user?.username || user?.email?.split("@")[0];

  return (
    <header
      style={{
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        color: "#fff",
        padding: "1rem 2rem",
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1
          style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
        >
          <span role="img" aria-label="dumbbell">
            🏋️
          </span>
          <span style={{ fontWeight: 700 }}>FitBuddy</span>
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ opacity: 0.9 }}>
            {username ? `Welcome back, ${username}!` : "Welcome back!"}
          </span>
        </div>
      </div>
    </header>
  );
}
