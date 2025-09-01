import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setLanguage, setTheme, setUnit } from "../store/slices/settingsSlice";
import { logout } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { language, theme, unit } = useAppSelector((s) => s.settings);

  const onSignOut = () => {
    dispatch(logout());
    navigate("/login");
  };

  const Section = (props: { title: string; children: any }) => (
    <section
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <h3 style={{ margin: 0, color: "#2563eb" }}>{props.title}</h3>
      </div>
      {props.children}
    </section>
  );

  const Row = (props: { label: string; control: any }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        alignItems: "center",
        gap: 16,
        padding: "10px 0",
      }}
    >
      <div style={{ color: "#6b7280" }}>{props.label}</div>
      <div>{props.control}</div>
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{ maxWidth: 900, margin: "0 auto", display: "grid", gap: 16 }}
      >
        <Section title="Preferences">
          <Row
            label="Language"
            control={
              <select
                value={language}
                onChange={(e) => dispatch(setLanguage(e.target.value as any))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            }
          />

          <Row
            label="Theme"
            control={
              <select
                value={theme}
                onChange={(e) => dispatch(setTheme(e.target.value as any))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">Auto (System)</option>
              </select>
            }
          />

          <Row
            label="Unit"
            control={
              <select
                value={unit}
                onChange={(e) => dispatch(setUnit(e.target.value as any))}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                <option value="metric">Metric</option>
                <option value="imperial">Imperial</option>
              </select>
            }
          />
        </Section>

        <Section title="Account">
          <button
            onClick={onSignOut}
            style={{
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "10px 16px",
              fontWeight: 700,
              boxShadow: "0 6px 18px rgba(239,68,68,0.35)",
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </Section>
      </div>
    </div>
  );
}
