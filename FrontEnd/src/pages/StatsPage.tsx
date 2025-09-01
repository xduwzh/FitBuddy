import { useEffect, useMemo, useState } from "react";
import http from "../apis/http";
import { useAppSelector } from "../store/hooks";

type Stats = { currentStreak: number; longestStreak: number };

export default function StatsPage() {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id ?? 0;

  const now = useMemo(() => new Date(), []);
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalCheckins, setTotalCheckins] = useState<number>(0);
  const [monthDays, setMonthDays] = useState<
    Array<{ day: number | null; checked: boolean }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${da}`;
  };

  useEffect(() => {
    if (!userId) return;
    const fetchAll = async () => {
      try {
        setError(null);
        // 1) streak stats
        const s = await http.get("/checkin/stats", { params: { userId } });
        setStats({
          currentStreak: s.data?.currentStreak ?? 0,
          longestStreak: s.data?.longestStreak ?? 0,
        });

        // 2) total check-ins since epoch
        const epoch = new Date(1970, 0, 1);
        const total = await http.get("/checkin/calendar", {
          params: { userId, start: fmt(epoch), end: fmt(now) },
        });
        setTotalCheckins((total.data || []).length);

        // 3) current month matrix
        const year = now.getFullYear();
        const monthIndex = now.getMonth();
        const first = new Date(year, monthIndex, 1);
        const last = new Date(year, monthIndex + 1, 0);
        const monthData = await http.get("/checkin/month", {
          params: { userId, year, month: monthIndex + 1 },
        });
        const checkedSet = new Set<string>(
          (monthData.data || []).map((c: any) => c.checkinDate)
        );

        const firstWeekday = first.getDay(); // 0..6 (Sun..Sat)
        const totalDays = last.getDate();
        const cells: Array<{ day: number | null; checked: boolean }> = [];
        for (let i = 0; i < firstWeekday; i++)
          cells.push({ day: null, checked: false });
        for (let d = 1; d <= totalDays; d++) {
          const cur = new Date(year, monthIndex, d);
          const iso = fmt(cur);
          cells.push({ day: d, checked: checkedSet.has(iso) });
        }
        while (cells.length % 7 !== 0)
          cells.push({ day: null, checked: false });
        setMonthDays(cells);
      } catch (e: any) {
        setError(e?.response?.data || e?.message || "Failed to load stats");
      }
    };
    fetchAll();
  }, [userId, now]);

  const WeekHeader = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: 10,
        color: "#6b7280",
        fontSize: 12,
        marginBottom: 8,
      }}
    >
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
        <div key={w} style={{ textAlign: "center" }}>
          {w}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <span role="img" aria-label="chart">
            📈
          </span>
          <h2 style={{ margin: 0, color: "#2563eb" }}>Your Statistics</h2>
        </div>

        {error && (
          <div style={{ color: "#dc3545", marginBottom: 12 }}>{error}</div>
        )}

        {/* Stat cards (no Total Points) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              background: "linear-gradient(180deg,#ffffff,#f7f9fc)",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              Total Check-ins
            </div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{totalCheckins}</div>
          </div>
          <div
            style={{
              background: "linear-gradient(180deg,#ffffff,#f7f9fc)",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: 13 }}>Current Streak</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {stats?.currentStreak ?? 0}
            </div>
          </div>
          <div
            style={{
              background: "linear-gradient(180deg,#ffffff,#f7f9fc)",
              borderRadius: 12,
              padding: 16,
              boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ color: "#6b7280", fontSize: 13 }}>Best Streak</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>
              {stats?.longestStreak ?? 0}
            </div>
          </div>
        </div>

        {/* Monthly Check-in History */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <span role="img" aria-label="calendar">
            📅
          </span>
          <h3 style={{ margin: 0, color: "#2563eb" }}>
            Monthly Check-in History
          </h3>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          }}
        >
          <WeekHeader />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 10,
            }}
          >
            {monthDays.map((c, idx) => (
              <div
                key={idx}
                style={{
                  height: 80,
                  borderRadius: 12,
                  background:
                    c.day && c.checked
                      ? "linear-gradient(135deg,#ff6b6b,#ee5a24)"
                      : "#eef2f7",
                  color: c.day
                    ? c.checked
                      ? "#fff"
                      : "#9ca3af"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                }}
              >
                {c.day ?? ""}
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Progress intentionally omitted */}
      </div>
    </div>
  );
}
