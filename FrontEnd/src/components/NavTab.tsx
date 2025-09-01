import { NavLink } from "react-router-dom";

const linkStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 4,
  textDecoration: "none",
  color: "#4a4a4a",
  fontSize: 12,
  flex: 1,
  padding: "10px 0",
};

export default function NavTab() {
  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#ffffff",
        borderTop: "1px solid #eaeaea",
        display: "flex",
        justifyContent: "space-around",
        paddingBottom: 4,
        boxShadow: "0 -6px 18px rgba(0,0,0,0.06)",
      }}
    >
      <NavLink
        to="/home"
        style={linkStyle}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <span role="img" aria-label="home">
          🏠
        </span>
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/stats"
        style={linkStyle}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <span role="img" aria-label="stats">
          📊
        </span>
        <span>Stats</span>
      </NavLink>
      <NavLink
        to="/profile"
        style={linkStyle}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <span role="img" aria-label="profile">
          👤
        </span>
        <span>Profile</span>
      </NavLink>

      <NavLink
        to="/settings"
        style={linkStyle}
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        <span role="img" aria-label="settings">
          ⚙️
        </span>
        <span>Settings</span>
      </NavLink>
    </nav>
  );
}
