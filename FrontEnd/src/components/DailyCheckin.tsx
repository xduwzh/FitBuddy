import { useEffect, useMemo, useState } from "react";
import http from "../apis/http";
import { useAppSelector } from "../store/hooks";

type Stats = { currentStreak: number; longestStreak: number };

export default function DailyCheckin() {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id ?? 0;

  const [checkedToday, setCheckedToday] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [week, setWeek] = useState<
    { day: string; date: string; checked: boolean }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const resToday = await http.get<boolean>("/checkin", {
          params: { userId },
        });
        setCheckedToday(Boolean(resToday.data));

        const resStats = await http.get("/checkin/stats", {
          params: { userId },
        });
        setStats({
          currentStreak: resStats.data.currentStreak ?? 0,
          longestStreak: resStats.data.longestStreak ?? 0,
        });

        // Build this week's range (Sun..Sat)
        const day = today.getDay(); // 0..6
        const sunday = new Date(today);
        sunday.setDate(today.getDate() - day);
        const saturday = new Date(sunday);
        saturday.setDate(sunday.getDate() + 6);

        const fmt = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const da = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${da}`;
        };
        const resCal = await http.get("/checkin/calendar", {
          params: { userId, start: fmt(sunday), end: fmt(saturday) },
        });
        const dates = new Set<string>(
          (resCal.data || []).map((c: any) => c.checkinDate)
        );

        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const days = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          const iso = fmt(d);
          return { day: labels[i], date: iso, checked: dates.has(iso) };
        });
        setWeek(days);
      } catch (e: any) {
        setError(e?.response?.data || e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId, today]);

  const handleCheckin = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      await http.post("/checkin", null, { params: { userId } });
      // Refresh today + stats + week
      const resToday = await http.get<boolean>("/checkin", {
        params: { userId },
      });
      setCheckedToday(Boolean(resToday.data));
      const resStats = await http.get("/checkin/stats", { params: { userId } });
      setStats({
        currentStreak: resStats.data.currentStreak ?? 0,
        longestStreak: resStats.data.longestStreak ?? 0,
      });

      const day = today.getDay();
      const sunday = new Date(today);
      sunday.setDate(today.getDate() - day);
      const saturday = new Date(sunday);
      saturday.setDate(sunday.getDate() + 6);
      const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const da = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${da}`;
      };
      const resCal = await http.get("/checkin/calendar", {
        params: { userId, start: fmt(sunday), end: fmt(saturday) },
      });
      const dates = new Set<string>(
        (resCal.data || []).map((c: any) => c.checkinDate)
      );
      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      setWeek(
        Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(sunday);
          d.setDate(sunday.getDate() + i);
          const iso = fmt(d);
          return { day: labels[i], date: iso, checked: dates.has(iso) };
        })
      );
    } catch (e: any) {
      setError(e?.response?.data || e?.message || "Failed to check in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px",
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <span role="img" aria-label="calendar">
          📅
        </span>
        <h2 style={{ margin: 0, color: "#1d4ed8" }}>Daily Check-in</h2>
      </div>

      {error && (
        <div style={{ color: "#dc3545", marginBottom: 12 }}>{error}</div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <button
          onClick={handleCheckin}
          disabled={checkedToday || loading}
          style={{
            background: checkedToday
              ? "#22c55e"
              : "linear-gradient(135deg,#4facfe,#00f2fe)",
            color: "#fff",
            border: "none",
            borderRadius: 24,
            padding: "12px 20px",
            fontWeight: 700,
            boxShadow: checkedToday
              ? "0 6px 18px rgba(34,197,94,0.35)"
              : "0 6px 18px rgba(79,172,254,0.35)",
            cursor: checkedToday ? "default" : "pointer",
          }}
        >
          {checkedToday ? "Checked In" : "Check In"}
        </button>

        <div style={{ color: "#555" }}>
          Streak: <strong>{stats?.currentStreak ?? 0} days</strong>
        </div>
      </div>

      <div style={{ color: "#333", margin: "10px 0 12px" }}>
        This Week's Check-ins
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 12,
        }}
      >
        {week.map((d) => (
          <div
            key={d.day}
            style={{
              height: 96,
              borderRadius: 14,
              background: d.checked
                ? "linear-gradient(135deg,#4facfe,#00f2fe)"
                : "#f3f4f6",
              color: d.checked ? "#fff" : "#9ca3af",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ fontWeight: 700 }}>{d.day}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
