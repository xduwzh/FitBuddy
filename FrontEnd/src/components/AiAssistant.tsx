import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAppSelector } from "../store/hooks";
import http from "../apis/http";

// Lazy import to avoid breaking build if key not set
let GoogleGenerativeAI: any;
const loadGenAI = async () => {
  if (GoogleGenerativeAI) return GoogleGenerativeAI;
  try {
    const mod = await import("@google/generative-ai");
    GoogleGenerativeAI = (mod as any).GoogleGenerativeAI;
  } catch {}
  return GoogleGenerativeAI;
};

type Profile = {
  username?: string;
  age?: number | null;
  gender?: string | null;
  primaryGoal?: string;
  targetWeight?: number | null;
};

type Msg = { role: "user" | "model"; text: string };

export default function AiAssistant() {
  const { user } = useAppSelector((s) => s.auth);
  const settings = useAppSelector((s) => s.settings);
  const userId = user?.id ?? 0;

  const [profile, setProfile] = useState<Profile>({ username: user?.username });
  const [messages, setMessages] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  // Load profile for personalization
  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await http.get(`/users/${userId}/profile`);
        const p = res.data || {};
        setProfile({
          username: p.username ?? user?.username,
          age: p.age ?? null,
          gender: p.gender ?? null,
          primaryGoal: p.primaryGoal ?? undefined,
          targetWeight: p.targetWeight != null ? Number(p.targetWeight) : null,
        });
      } catch {
        setProfile((prev) => ({ ...prev }));
      }
    })();
  }, [userId, user?.username]);

  // No initial model message to satisfy Gemini's requirement that history starts with a user role.
  // We render a visual greeting if there is no history.

  // Scroll chat to bottom
  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  const systemInstruction = useMemo(() => {
    const name = profile.username || user?.username || "User";
    const lang = settings.language;
    const unit = settings.unit;
    const goal = profile.primaryGoal || "MAINTAIN_HEALTH";
    const age = profile.age ? `Age: ${profile.age}` : "";
    const gender = profile.gender ? `Gender: ${profile.gender}` : "";
    const tw =
      profile.targetWeight != null
        ? `TargetWeight: ${profile.targetWeight} ${
            unit === "metric" ? "kg" : "lb"
          }`
        : "";

    const lines = [
      `You are an AI Fitness Assistant for ${name}.`,
      `Respond in ${lang === "zh" ? "Chinese" : "English"}.`,
      `Prefer ${unit === "metric" ? "metric" : "imperial"} units in outputs.`,
      `User profile: PrimaryGoal=${goal}. ${age} ${gender} ${tw}`.trim(),
      "Guidelines: Keep answers concise and structured. Offer clear steps, optional alternatives, and simple cautions. You are not a medical professional.",
    ];
    return lines.join("\n");
  }, [profile, settings.language, settings.unit, user?.username]);

  const send = async (text?: string) => {
    const userText = text ?? inputRef.current?.value ?? "";
    if (!userText.trim() || pending || busyRef.current) return;
    inputRef.current && (inputRef.current.value = "");
    setError(null);
    // UI: append user + a single placeholder model bubble
    setMessages((prev) => [
      ...prev,
      { role: "user", text: userText },
      { role: "model", text: "" },
    ]);
    setPending(true);
    busyRef.current = true;

    try {
      const Gen = await loadGenAI();
      if (!Gen || !apiKey) {
        throw new Error(
          settings.language === "zh"
            ? "缺少 API Key，请在 .env 中设置 VITE_GEMINI_API_KEY。"
            : "Missing API key. Set VITE_GEMINI_API_KEY in .env."
        );
      }
      const genAI = new Gen(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction,
      });

      // Prepare history for chat based on existing messages + this user input
      const base = [...messages, { role: "user", text: userText }];
      const firstUserIdx = base.findIndex((m) => m.role === "user");
      const history =
        firstUserIdx === -1
          ? []
          : base
              .slice(firstUserIdx)
              .map((m) => ({ role: m.role, parts: [{ text: m.text }] }));
      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(userText);

      let assembled = "";
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        assembled += chunkText;
        // Live update the single placeholder model bubble
        setMessages((prev) => {
          const next = [...prev];
          const lastIdx = next.length - 1;
          if (lastIdx >= 0 && next[lastIdx].role === "model") {
            next[lastIdx] = { role: "model", text: assembled };
          }
          return next;
        });
      }
      // Final text already set by the last chunk update
    } catch (e: any) {
      setError(e?.message || "Failed to send message");
    } finally {
      setPending(false);
      busyRef.current = false;
    }
  };

  const QuickButton = ({
    label,
    prompt,
  }: {
    label: string;
    prompt: string;
  }) => (
    <button
      onClick={() => send(prompt)}
      style={{
        border: "2px solid #60a5fa",
        color: "#2563eb",
        background: "#f8fbff",
        borderRadius: 22,
        padding: "8px 14px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );

  const placeholder =
    settings.language === "zh"
      ? "输入你的问题…"
      : "Type your question or thoughts…";

  return (
    <section
      style={{
        marginTop: 16,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
        padding: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span role="img" aria-label="bot">
            🤖
          </span>
          <h2 style={{ margin: 0, color: "#2563eb" }}>AI Fitness Assistant</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              background: "#22c55e",
              borderRadius: 999,
            }}
          />
          <span style={{ color: "#6b7280", fontSize: 13 }}>Online</span>
        </div>
      </div>

      {error && (
        <div style={{ color: "#dc3545", margin: "6px 0" }}>{error}</div>
      )}

      <div
        ref={chatRef}
        style={{
          background: "#f6f8fb",
          borderRadius: 12,
          padding: 16,
          height: 260,
          overflowY: "auto",
          marginBottom: 12,
        }}
      >
        {messages.length === 0 && (
          <div style={{ display: "flex", marginBottom: 10 }}>
            <div
              style={{
                marginRight: 8,
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "#e5f2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🤖
            </div>
            <div
              style={{
                background: "#eef7ff",
                color: "#374151",
                borderRadius: 14,
                padding: "10px 12px",
              }}
            >
              {settings.language === "zh"
                ? "你好！我是你的 AI 健身助手。我可以为你制定训练计划、解答营养问题，或陪你聊天。今天想做什么？"
                : "Hello! I'm your AI fitness assistant. I can create workout plans, answer nutrition questions, or just chat with you!"}
            </div>
          </div>
        )}
        {messages.map((m, idx) => (
          <div key={idx} style={{ display: "flex", marginBottom: 10 }}>
            <div
              style={{
                marginRight: 8,
                width: 36,
                height: 36,
                borderRadius: 999,
                background: m.role === "user" ? "#e2e8f0" : "#e5f2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {m.role === "user" ? "🧑" : "🤖"}
            </div>
            <div
              style={{
                background: m.role === "user" ? "#eef2f7" : "#eef7ff",
                color: "#374151",
                borderRadius: 14,
                padding: "10px 12px",
                maxWidth: "78%",
                whiteSpace: m.role === "user" ? "pre-wrap" : undefined,
              }}
            >
              {m.role === "model" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h3
                        style={{
                          margin: "6px 0",
                          fontSize: 16,
                          color: "#111827",
                        }}
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h4
                        style={{
                          margin: "6px 0",
                          fontSize: 15,
                          color: "#111827",
                        }}
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h5
                        style={{
                          margin: "6px 0",
                          fontSize: 14,
                          color: "#111827",
                        }}
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p style={{ margin: "6px 0" }} {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        style={{
                          margin: "6px 6px",
                          paddingLeft: 18,
                          listStyle: "disc",
                        }}
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        style={{ margin: "6px 6px", paddingLeft: 18 }}
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li style={{ margin: "2px 0" }} {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong style={{ color: "#111827" }} {...props} />
                    ),
                    code: ({ node, inline, ...props }: any) => (
                      <code
                        style={{
                          background: "#e5e7eb",
                          padding: inline ? "1px 4px" : "8px 10px",
                          borderRadius: 6,
                          display: inline ? "inline" : "block",
                          whiteSpace: "pre-wrap",
                        }}
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        style={{ color: "#2563eb" }}
                        target="_blank"
                        rel="noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {m.text.replace(/^__typing__/, "")}
                </ReactMarkdown>
              ) : (
                m.text.replace(/^__typing__/, "")
              )}
            </div>
          </div>
        ))}
        {pending && <div style={{ color: "#6b7280" }}>…</div>}
      </div>

      <div
        style={{ display: "flex", alignItems: "center", gap: 12 }}
        className="chat-window"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          style={{
            flex: 1,
            borderRadius: 24,
            border: "1px solid #e5e7eb",
            padding: "12px 16px",
            outline: "none",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button
          onClick={() => send()}
          disabled={pending}
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            border: "none",
            background: "linear-gradient(135deg,#4facfe,#00f2fe)",
            color: "#fff",
            fontSize: 18,
            cursor: pending ? "default" : "pointer",
          }}
        >
          ➤
        </button>
      </div>

      <div
        style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}
      >
        <QuickButton
          label={settings.language === "zh" ? "制定计划" : "Create Plan"}
          prompt={
            settings.language === "zh"
              ? `请根据我的目标（${
                  profile.primaryGoal || "保持健康"
                }），时间安排（每周 3~4 次），以及单位使用${
                  settings.unit === "metric" ? "公制" : "英制"
                }，生成 7 天训练计划。`
              : `Create a 7-day workout plan tailored to my goal (${
                  profile.primaryGoal || "Maintain Health"
                }), schedule (3-4x per week), using ${settings.unit} units.`
          }
        />
        <QuickButton
          label={settings.language === "zh" ? "营养建议" : "Nutrition Tips"}
          prompt={
            settings.language === "zh"
              ? "请给出简明的营养建议（蛋白质、碳水、健康脂肪、补水与恢复），并提供一天示例菜单。"
              : "Give concise nutrition tips (protein, carbs, healthy fats, hydration & recovery) and a 1-day sample menu."
          }
        />
        <QuickButton
          label={settings.language === "zh" ? "训练指南" : "Exercise Guide"}
          prompt={
            settings.language === "zh"
              ? "请列出 5 个适合初学者的力量训练动作，包含每个动作的组数、次数和注意事项。"
              : "List 5 beginner strength exercises with sets, reps, and key cues."
          }
        />
      </div>
    </section>
  );
}
