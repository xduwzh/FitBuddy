import { useEffect, useMemo, useState } from "react";
import http from "../apis/http";
import { useAppSelector } from "../store/hooks";

type PrimaryGoal =
  | "LOSE_WEIGHT"
  | "BUILD_MUSCLE"
  | "IMPROVE_FITNESS"
  | "MAINTAIN_HEALTH";

type Profile = {
  username: string;
  age?: number | null;
  gender?: string | null;
  primaryGoal: PrimaryGoal;
  targetWeight?: number | null;
};

const GOAL_OPTIONS: { label: string; value: PrimaryGoal }[] = [
  { label: "Lose Weight", value: "LOSE_WEIGHT" },
  { label: "Build Muscle", value: "BUILD_MUSCLE" },
  { label: "Improve Fitness", value: "IMPROVE_FITNESS" },
  { label: "Maintain Health", value: "MAINTAIN_HEALTH" },
];

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const userId = user?.id ?? 0;
  const defaultProfile: Profile = useMemo(
    () => ({
      username: user?.username ?? "",
      age: null,
      gender: "",
      primaryGoal: "MAINTAIN_HEALTH",
      targetWeight: null,
    }),
    [user?.username]
  );

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const run = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await http.get(`/users/${userId}/profile`);
        const p = res.data || {};
        setProfile({
          username: p.username ?? user?.username ?? "",
          age: p.age ?? null,
          gender: p.gender ?? "",
          primaryGoal: (p.primaryGoal as PrimaryGoal) ?? "MAINTAIN_HEALTH",
          targetWeight:
            p.targetWeight !== undefined && p.targetWeight !== null
              ? Number(p.targetWeight)
              : null,
        });
      } catch (e: any) {
        if (e?.response?.status === 404) {
          // No profile yet — use defaults, allow creating on save
          setProfile(defaultProfile);
        } else {
          setError(e?.response?.data || e?.message || "Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [userId, defaultProfile]);

  const onSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        username: profile.username ?? "",
        age: profile.age ?? null,
        gender: profile.gender ?? "",
        primaryGoal: profile.primaryGoal,
        targetWeight:
          profile.targetWeight === null || profile.targetWeight === undefined
            ? null
            : Number(profile.targetWeight),
      };
      const res = await http.put(`/users/${userId}/profile`, payload);
      const p = res.data || payload;
      setProfile({
        username: p.username ?? "",
        age: p.age ?? null,
        gender: p.gender ?? "",
        primaryGoal: (p.primaryGoal as PrimaryGoal) ?? "MAINTAIN_HEALTH",
        targetWeight:
          p.targetWeight !== undefined && p.targetWeight !== null
            ? Number(p.targetWeight)
            : null,
      });
      setEditing(false);
      setSuccess("Profile saved");
    } catch (e: any) {
      setError(e?.response?.data || e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const Labeled = (props: { title: string; children: any }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ color: "#6b7280", fontSize: 12 }}>{props.title}</div>
      {props.children}
    </div>
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header card (no Level badge) */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                background: "#e5f2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              👤
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>
                {profile.username || user?.username || "User"}
              </div>
              {user?.email && (
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {user.email}
                </div>
              )}
            </div>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={{
                background: "linear-gradient(135deg,#4facfe,#00f2fe)",
                color: "#fff",
                border: "none",
                borderRadius: 24,
                padding: "10px 16px",
                fontWeight: 700,
                boxShadow: "0 6px 18px rgba(79,172,254,0.35)",
                cursor: "pointer",
              }}
            >
              ✏️ Edit Profile
            </button>
          ) : (
            <button
              onClick={onSave}
              disabled={saving}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 24,
                padding: "10px 16px",
                fontWeight: 700,
                boxShadow: "0 6px 18px rgba(34,197,94,0.35)",
                cursor: saving ? "default" : "pointer",
                opacity: saving ? 0.8 : 1,
              }}
            >
              💾 Save Profile
            </button>
          )}
        </div>

        {error && (
          <div style={{ color: "#dc3545", marginBottom: 12 }}>{error}</div>
        )}
        {success && (
          <div style={{ color: "#16a34a", marginBottom: 12 }}>{success}</div>
        )}

        {/* Personal Information (no Email; Full Name -> User Name) */}
        <section
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
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
            <span role="img" aria-label="info">
              🧍
            </span>
            <h3 style={{ margin: 0, color: "#2563eb" }}>
              Personal Information
            </h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            <Labeled title="User Name">
              <input
                type="text"
                value={profile.username || ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, username: e.target.value }))
                }
                disabled={!editing}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                }}
              />
            </Labeled>

            {/* Email omitted per requirement */}

            <Labeled title="Age">
              <input
                type="number"
                value={profile.age ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    age: e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                disabled={!editing}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                }}
              />
            </Labeled>

            <Labeled title="Gender">
              <select
                value={profile.gender ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, gender: e.target.value }))
                }
                disabled={!editing}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                  background: "#fff",
                }}
              >
                <option value="">Select</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </Labeled>
          </div>
        </section>

        {/* Fitness Goals (no weekly workout goal) */}
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
              marginBottom: 16,
            }}
          >
            <span role="img" aria-label="target">
              🎯
            </span>
            <h3 style={{ margin: 0, color: "#2563eb" }}>Fitness Goals</h3>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
            }}
          >
            <Labeled title="Primary Goal">
              <select
                value={profile.primaryGoal}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    primaryGoal: e.target.value as PrimaryGoal,
                  }))
                }
                disabled={!editing}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                  background: "#fff",
                }}
              >
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </Labeled>

            <Labeled title="Target Weight (kg)">
              <input
                type="number"
                value={profile.targetWeight ?? ""}
                onChange={(e) =>
                  setProfile((p) => ({
                    ...p,
                    targetWeight:
                      e.target.value === "" ? null : Number(e.target.value),
                  }))
                }
                disabled={!editing}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  outline: "none",
                }}
              />
            </Labeled>
          </div>
        </section>

        {loading && (
          <div style={{ color: "#6b7280", marginTop: 12 }}>Loading…</div>
        )}
      </div>
    </div>
  );
}
