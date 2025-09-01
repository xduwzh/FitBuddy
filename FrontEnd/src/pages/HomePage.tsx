import DailyCheckin from "../components/DailyCheckin";
import AiAssistant from "../components/AiAssistant";

export default function HomePage() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <DailyCheckin />
        <AiAssistant />
      </div>
    </div>
  );
}
