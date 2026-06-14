import { useState, useEffect, useRef } from "react";

const PROJECTS = [
  {
    id: 1,
    name: "Microsoft Hackathon",
    emoji: "🏆",
    status: "paused",
    lastActive: "47 days ago",
    progress: 72,
    tasks: 14,
    done: 8,
    files: 23,
    tabs: 8,
    decisions: 11,
    color: "#6366f1",
  },
  {
    id: 2,
    name: "Agroverse Platform",
    emoji: "🌱",
    status: "active",
    lastActive: "3 days ago",
    progress: 45,
    tasks: 22,
    done: 10,
    files: 41,
    tabs: 12,
    decisions: 7,
    color: "#10b981",
  },
  {
    id: 3,
    name: "DSA Practice Sheet",
    emoji: "💡",
    status: "active",
    lastActive: "yesterday",
    progress: 60,
    tasks: 30,
    done: 18,
    files: 6,
    tabs: 5,
    decisions: 2,
    color: "#f59e0b",
  },
  {
    id: 4,
    name: "Research Notes",
    emoji: "📚",
    status: "paused",
    lastActive: "1 week ago",
    progress: 30,
    tasks: 8,
    done: 2,
    files: 14,
    tabs: 3,
    decisions: 4,
    color: "#8b5cf6",
  },
  {
    id: 5,
    name: "Portfolio Website",
    emoji: "🎨",
    status: "archived",
    lastActive: "2 months ago",
    progress: 100,
    tasks: 16,
    done: 16,
    files: 31,
    tabs: 0,
    decisions: 9,
    color: "#ec4899",
  },
];

const TIMELINE_EVENTS = [
  { time: "09:12 AM", type: "session", title: "Resumed FlowPilot Prototype", desc: "Opened VS Code, restored Figma designs, reviewed GitHub issues from last session.", tag: "Session Start", tagColor: "#10b981" },
  { time: "10:48 AM", type: "decision", title: "Decision: Copilot Integration Architecture", desc: "Decided to use Work IQ as the memory abstraction layer. Avoids direct user exposure to Copilot internals. Unanimous.", tag: "Decision", tagColor: "#f59e0b" },
  { time: "11:30 AM", type: "note", title: "Note: Judging Criteria Analysis", desc: "Innovation 25% is highest weight. UX 20% matters more than Copilot integration 15%. Need stronger innovation narrative.", tag: "Note", tagColor: "#818cf8" },
  { time: "02:15 PM", type: "file", title: "File Modified: flowpilot-core.ts", desc: "Implemented session capture engine. Added WorkIQ.snapshot() integration. 187 lines added.", tag: "File", tagColor: "#60a5fa" },
  { time: "03:45 PM", type: "decision", title: "Decision: Chose Vanilla HTML over React", desc: "For maximum performance and easier Windows Shell embedding. Trade-off acknowledged.", tag: "Decision", tagColor: "#f59e0b" },
  { time: "05:20 PM", type: "session", title: "Session Ended — 6 tasks unfinished", desc: "FlowPilot saved complete context snapshot. Workspace frozen at this moment.", tag: "Paused", tagColor: "#f87171" },
];

const LIVE_FEED = [
  { icon: "🌐", text: "Tab captured: Microsoft Hackathon Guidelines · microsoft.com" },
  { icon: "📁", text: "File tracked: flowpilot-core.ts (modified)" },
  { icon: "💡", text: "Decision detected: Using Work IQ API for memory layer" },
  { icon: "✅", text: "Task logged: Implement Copilot reasoning pipeline" },
  { icon: "📝", text: "Note captured: Innovation score needs stronger narrative" },
  { icon: "🔗", text: "Reference saved: Fluent Design System documentation" },
  { icon: "🌐", text: "Tab captured: Azure OpenAI Service docs" },
  { icon: "📁", text: "File tracked: architecture-v2.figma (opened)" },
];

const WHY_ANALYSIS = [
  { type: "cause", text: "Missing offline-first sync layer — judges flagged Enterprise Readiness (15%). Noted April 8th, never shipped." },
  { type: "cause", text: "No voice activation — planned on April 12th, listed as unfinished. Competitors had voice UX." },
  { type: "cause", text: "Innovation narrative too weak — pitch didn't lead with OS-level memory story (worth 25% of score)." },
  { type: "cause", text: "Demo not fully rehearsed — keynote slide deck was marked unfinished in your task list." },
  { type: "opportunity", text: "Enterprise security docs were never completed. Judges value compliance readiness." },
  { type: "opportunity", text: "User testing with 3 pilot participants was logged as a task and never done." },
  { type: "action", text: "Ship voice activation — 3 days of work, maximum visible impact." },
  { type: "action", text: "Complete offline sync — directly addresses the Enterprise Readiness gap." },
  { type: "action", text: "Reframe pitch — lead with Windows OS-level work memory story." },
  { type: "action", text: "Run 3 user tests and include results in the submission." },
];

// Orb component
function Orb({ size = 52, active = false, recording = false, pulse = false }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* Glow ring */}
      <div style={{
        position: "absolute",
        inset: -size * 0.3,
        borderRadius: "50%",
        background: recording
          ? "radial-gradient(ellipse at center, rgba(239,68,68,0.3) 0%, transparent 70%)"
          : "radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, transparent 70%)",
        animation: "orbGlow 4s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      {/* Rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: "absolute",
          inset: -i * (size * 0.1),
          borderRadius: "50%",
          border: `1px solid ${recording ? "rgba(239,68,68,0.3)" : "rgba(99,102,241,0.3)"}`,
          animation: `orbRing 3s ease-in-out infinite`,
          animationDelay: `${i * 0.5}s`,
          opacity: 1 - i * 0.3,
        }} />
      ))}
      {/* Core */}
      <div style={{
        position: "absolute",
        inset: size * 0.1,
        borderRadius: "50%",
        background: recording
          ? "radial-gradient(circle at 30% 30%, #f87171, #ef4444 40%, #dc2626 70%, #991b1b)"
          : "radial-gradient(circle at 30% 30%, #818cf8, #6366f1 40%, #4f46e5 70%, #3730a3)",
        boxShadow: recording
          ? "0 0 40px rgba(239,68,68,0.7), 0 0 80px rgba(239,68,68,0.3)"
          : "0 0 40px rgba(99,102,241,0.7), 0 0 80px rgba(99,102,241,0.3)",
        animation: active || pulse ? "orbPulse 2s ease-in-out infinite" : "orbBreath 4s ease-in-out infinite",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Shimmer */}
        <div style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4) 0%, transparent 55%)",
        }} />
        <span style={{ fontSize: size * 0.3, position: "relative", zIndex: 1, filter: "brightness(2)" }}>✦</span>
      </div>
    </div>
  );
}

// Typing indicator
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "8px 0" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#6366f1",
          animation: "typingDot 1.2s ease-in-out infinite",
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 6 }}>FlowPilot + Copilot reasoning…</span>
    </div>
  );
}

// Copilot pipeline bar
function CopilotBar({ step }) {
  const steps = ["You", "FlowPilot", "Work IQ", "Copilot", "FlowPilot"];
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(0,120,212,0.1), rgba(99,102,241,0.08))",
      border: "1px solid rgba(0,120,212,0.3)",
      borderRadius: 12,
      padding: "10px 14px",
      marginBottom: 10,
      animation: "cpPulse 2s ease-in-out infinite",
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "rgba(0,120,212,0.9)", textTransform: "uppercase", marginBottom: 8 }}>
        🔬 Work IQ · Copilot Reasoning Pipeline
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              background: i <= step ? "rgba(0,120,212,0.2)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${i <= step ? "rgba(0,120,212,0.5)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 6, padding: "3px 10px", fontSize: 11,
              color: i <= step ? "#60a5fa" : "rgba(255,255,255,0.35)",
              transition: "all 0.4s ease",
              boxShadow: i <= step ? "0 0 12px rgba(0,120,212,0.3)" : "none",
            }}>{s}</div>
            {i < steps.length - 1 && <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>→</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("splash"); // splash | main
  const [tab, setTab] = useState("home"); // home | chat | timeline | recording | projects
  const [panelOpen, setPanelOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [recording, setRecording] = useState(false);
  const [recordingProject, setRecordingProject] = useState(null);
  const [messages, setMessages] = useState([
    { role: "ai", content: "splash", id: 0 }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [cpStep, setCpStep] = useState(-1);
  const [liveFeedItems, setLiveFeedItems] = useState(LIVE_FEED.slice(0, 5));
  const [feedIdx, setFeedIdx] = useState(5);
  const [modal, setModal] = useState(null); // null | "startMemory" | "projectDetail"
  const [selectedProject, setSelectedProject] = useState(null);
  const [toast, setToast] = useState(null);
  const chatEndRef = useRef(null);
  const feedIntervalRef = useRef(null);

  const bg = dark ? "#08080f" : "#f0f0f8";
  const panel = dark ? "rgba(12,12,25,0.95)" : "rgba(245,245,255,0.96)";
  const text = dark ? "rgba(255,255,255,0.92)" : "rgba(10,10,30,0.92)";
  const textMuted = dark ? "rgba(255,255,255,0.38)" : "rgba(10,10,30,0.38)";
  const textSub = dark ? "rgba(255,255,255,0.6)" : "rgba(10,10,30,0.6)";
  const glassBg = dark ? "rgba(255,255,255,0.04)" : "rgba(99,102,241,0.05)";
  const glassBg2 = dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)";
  const border = dark ? "rgba(255,255,255,0.08)" : "rgba(99,102,241,0.15)";

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (recording) {
      feedIntervalRef.current = setInterval(() => {
        setFeedIdx(i => {
          const next = i % LIVE_FEED.length;
          setLiveFeedItems(prev => [LIVE_FEED[next], ...prev.slice(0, 6)]);
          return next + 1;
        });
      }, 2800);
    } else {
      clearInterval(feedIntervalRef.current);
    }
    return () => clearInterval(feedIntervalRef.current);
  }, [recording]);

  function showToast(icon, title, sub) {
    setToast({ icon, title, sub });
    setTimeout(() => setToast(null), 4000);
  }

  function startRecording(proj) {
    setRecordingProject(proj);
    setRecording(true);
    setModal(null);
    setTab("recording");
    setPanelOpen(true);
    showToast("⏺", "Memory Session Started", proj.name + " · context capture active");
  }

  function stopRecording() {
    setRecording(false);
    setTab("home");
    showToast("✅", "Session Saved", "Memory captured for " + recordingProject?.name);
  }

  async function sendMessage(text) {
    if (!text.trim()) return;
    const userMsg = { role: "user", content: text, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTab("chat");
    setPanelOpen(true);

    const lower = text.toLowerCase();
    if (lower.includes("continue") && (lower.includes("hackathon") || lower.includes("microsoft"))) {
      await restoreContext();
    } else if (lower.includes("june 14") || lower.includes("14th")) {
      await june14Response();
    } else if ((lower.includes("second") || lower.includes("2nd") || lower.includes("why")) && lower.includes("prize")) {
      await whyPrizeResponse();
    } else if (lower.includes("start") && (lower.includes("memory") || lower.includes("project") || lower.includes("session"))) {
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, { role: "ai", content: "start_memory", id: Date.now() }]);
        setModal("startMemory");
      }, 800);
    } else {
      setTimeout(() => {
        setTyping(false);
        setMessages(prev => [...prev, {
          role: "ai", content: "generic", id: Date.now(),
          text: "I searched your work memory. Your most relevant project is the **Microsoft Hackathon Project**, where you logged 11 decisions and 14 tasks. Want me to restore the full context?"
        }]);
      }, 1000);
    }
  }

  async function restoreContext() {
    await delay(600);
    setCpStep(0);
    await delay(500); setCpStep(1);
    await delay(500); setCpStep(2);
    await delay(500); setCpStep(3);
    await delay(500); setCpStep(4);
    await delay(600);
    setTyping(false);
    setCpStep(-1);
    setMessages(prev => [...prev, { role: "ai", content: "restore", id: Date.now() }]);
    showToast("🔄", "Context Restored!", "Microsoft Hackathon Project · 47 days recovered");
  }

  async function june14Response() {
    await delay(1000);
    setTyping(false);
    setMessages(prev => [...prev, { role: "ai", content: "june14", id: Date.now() }]);
  }

  async function whyPrizeResponse() {
    setCpStep(0);
    await delay(600); setCpStep(1);
    await delay(600); setCpStep(2);
    await delay(600); setCpStep(3);
    await delay(700); setCpStep(4);
    await delay(800);
    setTyping(false);
    setCpStep(-1);
    setMessages(prev => [...prev, { role: "ai", content: "whyPrize", id: Date.now() }]);
    showToast("🔍", "Root Cause Ready", "Copilot analyzed 47 days of memory");
  }

  function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  if (screen === "splash") {
    return (
      <div style={{
        width: "100%", height: "100vh", background: "#06060e",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 28, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        position: "relative", overflow: "hidden",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          @keyframes orbGlow { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.15)} }
          @keyframes orbRing { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.08);opacity:.8} }
          @keyframes orbBreath { 0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(99,102,241,.5),0 0 80px rgba(99,102,241,.2)} 50%{transform:scale(1.06);box-shadow:0 0 60px rgba(99,102,241,.8),0 0 120px rgba(99,102,241,.35)} }
          @keyframes orbPulse { 0%,100%{transform:scale(1);box-shadow:0 0 60px rgba(99,102,241,.9),0 0 120px rgba(99,102,241,.4)} 50%{transform:scale(1.1);box-shadow:0 0 80px rgba(99,102,241,1),0 0 160px rgba(99,102,241,.5)} }
          @keyframes splashTitle { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
          @keyframes typingDot { 0%,80%,100%{transform:scale(.6);opacity:.5} 40%{transform:scale(1);opacity:1} }
          @keyframes cpPulse { 0%,100%{border-color:rgba(0,120,212,.3)} 50%{border-color:rgba(0,120,212,.6);box-shadow:0 0 20px rgba(0,120,212,.1)} }
          @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes feedIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
          @keyframes toastIn { from{opacity:0;transform:translateX(100%)} to{opacity:1;transform:translateX(0)} }
          @keyframes progressFill { from{width:0} to{width:var(--w)} }
          @keyframes starFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        `}</style>
        {/* Particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: "absolute",
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#6366f1" : i % 3 === 1 ? "#8b5cf6" : "#60a5fa",
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            opacity: 0.4 + Math.random() * 0.4,
            animation: `starFloat ${3 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }} />
        ))}
        <Orb size={100} />
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 52, fontWeight: 900, letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #818cf8, #a78bfa, #60a5fa, #818cf8)",
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "splashTitle 4s ease-in-out infinite",
            fontFamily: "'Inter', sans-serif",
          }}>FlowPilot</div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.7 }}>
            Your personal AI work-memory companion.<br />
            Computers remember files. <strong style={{ color: "rgba(255,255,255,0.75)" }}>FlowPilot remembers work.</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <span style={{ background: "rgba(0,120,212,0.15)", border: "1px solid rgba(0,120,212,0.3)", borderRadius: 100, padding: "3px 10px", color: "#60a5fa", fontWeight: 600 }}>🤖 Copilot</span>
          ·
          <span style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 100, padding: "3px 10px", color: "#818cf8", fontWeight: 600 }}>🔬 Work IQ</span>
          ·
          <span style={{ color: "rgba(255,255,255,0.35)" }}>Windows 11</span>
        </div>
        <button onClick={() => { setScreen("main"); setPanelOpen(true); setMessages([{ role: "ai", content: "welcome", id: 0 }]); }}
          style={{
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none", borderRadius: 14, padding: "14px 44px",
            fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer",
            boxShadow: "0 8px 30px rgba(99,102,241,0.5)",
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "-0.01em",
          }}>
          Enter FlowPilot →
        </button>
      </div>
    );
  }

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: bg,
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden",
      transition: "background 0.4s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes orbGlow { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.15)} }
        @keyframes orbRing { 0%,100%{transform:scale(1);opacity:.4} 50%{transform:scale(1.08);opacity:.8} }
        @keyframes orbBreath { 0%,100%{transform:scale(1);box-shadow:0 0 40px rgba(99,102,241,.5),0 0 80px rgba(99,102,241,.2)} 50%{transform:scale(1.06);box-shadow:0 0 60px rgba(99,102,241,.8),0 0 120px rgba(99,102,241,.35)} }
        @keyframes orbPulse { 0%,100%{transform:scale(1);box-shadow:0 0 60px rgba(99,102,241,.9),0 0 120px rgba(99,102,241,.4)} 50%{transform:scale(1.1);box-shadow:0 0 80px rgba(99,102,241,1),0 0 160px rgba(99,102,241,.5)} }
        @keyframes typingDot { 0%,80%,100%{transform:scale(.6);opacity:.5} 40%{transform:scale(1);opacity:1} }
        @keyframes cpPulse { 0%,100%{border-color:rgba(0,120,212,.3)} 50%{border-color:rgba(0,120,212,.6);box-shadow:0 0 20px rgba(0,120,212,.1)} }
        @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes feedIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes toastIn { from{opacity:0;transform:translateX(120%)} to{opacity:1;transform:translateX(0)} }
        @keyframes recPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:.6} }
        @keyframes starFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes liveBlink { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes splashTitle { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 2px; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: panelOpen ? 436 : 84, zIndex: 500,
          background: panel, backdropFilter: "blur(40px)",
          border: `1px solid ${border}`,
          borderRadius: 14, padding: "12px 16px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          animation: "toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
          maxWidth: 300,
        }}>
          <span style={{ fontSize: 20 }}>{toast.icon}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 12, color: text }}>{toast.title}</div>
            <div style={{ fontSize: 11, color: textMuted }}>{toast.sub}</div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal === "startMemory" && (
        <div onClick={() => setModal(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(10px)", zIndex: 400,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: panel, backdropFilter: "blur(40px)",
            border: `1px solid ${border}`, borderRadius: 24,
            padding: 32, maxWidth: 440, width: "90%",
            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: text, marginBottom: 8 }}>🧠 Start Memory Session</div>
            <div style={{ fontSize: 13, color: textSub, marginBottom: 24, lineHeight: 1.6 }}>
              FlowPilot will begin capturing work context — tabs, files, decisions, and tasks. Privacy-first: only runs when you choose.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
              {PROJECTS.filter(p => p.status !== "archived").map(p => (
                <button key={p.id} onClick={() => startRecording(p)} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px",
                  background: glassBg, border: `1px solid ${border}`,
                  borderRadius: 14, cursor: "pointer", textAlign: "left",
                  color: text, fontFamily: "'Inter', sans-serif",
                  transition: "all 0.15s ease",
                }}>
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>Last active: {p.lastActive}</div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setModal(null)} style={{
              width: "100%", padding: "10px", background: glassBg,
              border: `1px solid ${border}`, borderRadius: 10,
              color: textSub, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif",
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", height: "calc(100vh - 48px)", overflow: "hidden" }}>

        {/* Desktop background */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            background: dark
              ? "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(99,102,241,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 20%, rgba(139,92,246,0.05) 0%, transparent 60%)"
              : "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(99,102,241,0.05) 0%, transparent 60%)",
          }} />

          {/* Simulated browser window */}
          <div style={{
            position: "absolute", top: 40, left: 40, width: 520, height: 340,
            background: panel, backdropFilter: "blur(20px)",
            border: `1px solid ${border}`, borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}>
            <div style={{ height: 36, background: glassBg, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: textMuted }}>Microsoft Edge — Hackathon Docs</div>
            </div>
            <div style={{ padding: 12 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
                {["Hackathon Guidelines", "Work IQ API", "Copilot Docs", "Azure Portal"].map((t, i) => (
                  <div key={t} style={{
                    background: i === 0 ? "rgba(99,102,241,0.2)" : glassBg,
                    border: `1px solid ${i === 0 ? "rgba(99,102,241,0.4)" : border}`,
                    borderRadius: 6, padding: "3px 8px", fontSize: 10,
                    color: i === 0 ? "#818cf8" : textSub, whiteSpace: "nowrap",
                  }}>{t}</div>
                ))}
              </div>
              <div style={{ background: glassBg, border: `1px solid ${border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, color: textMuted, marginBottom: 10 }}>
                🔒 microsoft.com/hackathon/guidelines
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: textSub }}>
                <div style={{ fontWeight: 700, color: text, marginBottom: 6 }}>Microsoft AI Hackathon — Judging Criteria</div>
                Projects evaluated across: Innovation, Technical Depth, User Experience, Enterprise Readiness, and Copilot Integration.
                <div style={{ marginTop: 8 }}>
                  {["Innovation 25%", "Technical 25%", "UX 20%", "Enterprise 15%", "Copilot 15%"].map(t => (
                    <span key={t} style={{ display: "inline-block", background: "rgba(99,102,241,0.15)", borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "#818cf8", margin: "2px 3px" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* VS Code window */}
          <div style={{
            position: "absolute", top: 60, left: 580, width: 350, height: 220,
            background: panel, backdropFilter: "blur(20px)",
            border: `1px solid ${border}`, borderRadius: 14,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}>
            <div style={{ height: 36, background: glassBg, borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 6, padding: "0 12px" }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
              <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: textMuted }}>VS Code — flowpilot-core.ts</div>
            </div>
            <div style={{ padding: 12, fontFamily: "'Courier New', monospace", fontSize: 11, lineHeight: 1.8 }}>
              {[
                ["// FlowPilot Core — Memory Engine", "#6b7280"],
                ["import { WorkIQ } from '@microsoft/workiq'", null],
                ["import { CopilotReasoner } from '@microsoft/copilot-sdk'", null],
                ["", null],
                ["class FlowPilotEngine {", null],
                ["  captureContext(session) {", null],
                ["    const mem = WorkIQ.snapshot()", null],
                ["    return WorkIQ.store(mem, session)", null],
                ["  }", null],
              ].map(([line, color], i) => (
                <div key={i} style={{ display: "flex", gap: 12 }}>
                  <span style={{ color: textMuted, minWidth: 16, textAlign: "right" }}>{i + 1}</span>
                  <span style={{ color: color || (line.includes("import") ? "#818cf8" : line.includes("class") || line.includes("const") || line.includes("return") ? "#818cf8" : line.includes("WorkIQ") || line.includes("Copilot") ? "#34d399" : line.startsWith("//") ? "#6b7280" : line.includes("'") ? "#fb923c" : textSub) }}>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hero moment hint */}
          <div style={{ position: "absolute", bottom: 30, left: 40, fontSize: 12, color: textMuted }}>
            <div style={{ fontWeight: 600, color: textSub, marginBottom: 4 }}>June 14, 2026 · Two months after the hackathon</div>
            <div>Open FlowPilot and say <strong style={{ color: "#6366f1", cursor: "pointer" }} onClick={() => { setPanelOpen(true); setTab("chat"); setTimeout(() => sendMessage("Continue my Microsoft Hackathon Project"), 300); }}>"Continue my Microsoft Hackathon Project"</strong></div>
          </div>
        </div>

        {/* FlowPilot Sidebar Icon Bar */}
        <div style={{
          width: 72, height: "100%",
          background: panel, backdropFilter: "blur(40px)",
          borderLeft: `1px solid ${border}`,
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "20px 0", zIndex: 50, flexShrink: 0,
        }}>
          <div onClick={() => { setPanelOpen(!panelOpen); }} style={{ cursor: "pointer" }}>
            <Orb size={52} active={panelOpen} recording={recording} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", color: textMuted, textTransform: "uppercase", marginTop: 8 }}>FlowPilot</div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginTop: 20 }}>
            {[
              { icon: "🏠", id: "home", label: "Home" },
              { icon: "💬", id: "chat", label: "Ask" },
              { icon: "📁", id: "projects", label: "Projects" },
              { icon: "📅", id: "timeline", label: "Timeline" },
            ].map(item => (
              <div key={item.id} onClick={() => { setTab(item.id); setPanelOpen(true); }}
                title={item.label}
                style={{
                  width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 12, cursor: "pointer", fontSize: 18,
                  background: tab === item.id && panelOpen ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))" : "transparent",
                  border: `1px solid ${tab === item.id && panelOpen ? "rgba(99,102,241,0.35)" : "transparent"}`,
                  transition: "all 0.15s ease",
                }}>
                {item.icon}
              </div>
            ))}
            {recording && (
              <div onClick={() => setTab("recording")}
                title="Live Session"
                style={{
                  width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 12, cursor: "pointer", fontSize: 18,
                  background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)",
                }}>⏺</div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 8 }}>
            <div onClick={() => setModal("startMemory")} title="Start Memory"
              style={{
                width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 10, cursor: "pointer", fontSize: 16,
                background: glassBg, border: `1px solid ${border}`,
              }}>⏺</div>
            <div onClick={() => setDark(!dark)} title="Toggle theme"
              style={{
                width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: 10, cursor: "pointer", fontSize: 16,
                background: glassBg, border: `1px solid ${border}`,
              }}>{dark ? "🌙" : "☀️"}</div>
          </div>
        </div>

        {/* FlowPilot Panel */}
        <div style={{
          position: "absolute", right: 72, top: 0, bottom: 0, width: 420,
          background: panel, backdropFilter: "blur(60px)",
          borderLeft: `1px solid ${border}`,
          boxShadow: "inset 0 0 60px rgba(99,102,241,0.02), -20px 0 60px rgba(0,0,0,0.3)",
          display: "flex", flexDirection: "column",
          transform: panelOpen ? "translateX(0)" : "translateX(calc(100% + 72px))",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          zIndex: 49, overflow: "hidden",
        }}>
          {/* Panel gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 100% 50% at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)",
            pointerEvents: "none",
          }} />

          {/* Header */}
          <div style={{ padding: "20px 20px 0", position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%, #818cf8, #6366f1 40%, #4f46e5 70%, #3730a3)",
                boxShadow: "0 0 20px rgba(99,102,241,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
              }}>✦</div>
              <span style={{
                fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em",
                background: "linear-gradient(135deg, #818cf8, #a78bfa, #60a5fa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>FlowPilot</span>
              <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 600, letterSpacing: "0.1em", color: textMuted, textTransform: "uppercase" }}>Win 11 Preview</span>
              <button onClick={() => setPanelOpen(false)} style={{ background: "none", border: "none", color: textMuted, cursor: "pointer", fontSize: 18, padding: "2px 6px" }}>×</button>
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: glassBg, border: `1px solid ${border}`,
              borderRadius: 100, padding: "5px 12px", fontSize: 11, color: textSub, marginBottom: 14,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: recording ? "#ef4444" : "#34d399",
                boxShadow: recording ? "0 0 8px #ef4444" : "0 0 6px #34d399",
                animation: "liveBlink 2s ease-in-out infinite",
              }} />
              {recording ? `Recording Active — ${recordingProject?.name}` : "Ready — Privacy Mode"}
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: "flex", gap: 4, padding: "0 20px 12px", borderBottom: `1px solid ${border}`, position: "relative", zIndex: 1 }}>
            {[
              { id: "home", label: "🏠 Home" },
              { id: "chat", label: "💬 Ask" },
              { id: "projects", label: "📁 Projects" },
              { id: "timeline", label: "📅 Timeline" },
              ...(recording ? [{ id: "recording", label: "⏺ Live" }] : []),
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, padding: "7px 4px", borderRadius: 8, fontSize: 11, fontWeight: 600,
                cursor: "pointer", border: "none", fontFamily: "'Inter', sans-serif",
                background: tab === t.id ? "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))" : "transparent",
                color: tab === t.id ? "#818cf8" : textMuted,
                boxShadow: tab === t.id ? "inset 0 0 0 1px rgba(99,102,241,0.2)" : "none",
              }}>{t.label}</button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1 }}>

            {/* HOME TAB */}
            {tab === "home" && (
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", color: text, marginBottom: 4 }}>
                    Good afternoon, Arul 👋
                  </div>
                  <div style={{ fontSize: 12, color: textMuted }}>Sunday, June 14, 2026</div>
                </div>

                {/* Quick actions */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <button onClick={() => { setTab("chat"); setTimeout(() => sendMessage("Continue my Microsoft Hackathon Project"), 300); }} style={{
                    gridColumn: "1 / -1",
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                    border: "1px solid rgba(99,102,241,0.3)", borderRadius: 14,
                    cursor: "pointer", color: text, fontFamily: "'Inter', sans-serif", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 20 }}>🔄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>Continue Hackathon Project</div>
                      <div style={{ fontSize: 11, color: textMuted }}>47 days ago · Restore full context</div>
                    </div>
                    <span style={{ color: "#6366f1", fontSize: 18 }}>→</span>
                  </button>
                  <button onClick={() => setModal("startMemory")} style={{
                    display: "flex", flexDirection: "column", gap: 4, padding: "14px 12px",
                    background: glassBg, border: `1px solid ${border}`, borderRadius: 14,
                    cursor: "pointer", color: text, fontFamily: "'Inter', sans-serif", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 20 }}>⏺</span>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>Start Memory</div>
                    <div style={{ fontSize: 10, color: textMuted }}>Begin a session</div>
                  </button>
                  <button onClick={() => { setTab("chat"); setTimeout(() => sendMessage("What did I work on June 14th?"), 300); }} style={{
                    display: "flex", flexDirection: "column", gap: 4, padding: "14px 12px",
                    background: glassBg, border: `1px solid ${border}`, borderRadius: 14,
                    cursor: "pointer", color: text, fontFamily: "'Inter', sans-serif", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 20 }}>📅</span>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>June 14th</div>
                    <div style={{ fontSize: 10, color: textMuted }}>What did I work on?</div>
                  </button>
                </div>

                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted, marginBottom: 10 }}>Memory Sessions</div>
                {PROJECTS.map(p => (
                  <ProjectCard key={p.id} p={p} text={text} textSub={textSub} textMuted={textMuted} glassBg={glassBg} border={border}
                    onClick={() => { setSelectedProject(p); setTab("projects"); }} />
                ))}
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14, fontSize: 11 }}>
                  <span style={{ background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.2)", borderRadius: 100, padding: "3px 10px", color: "#60a5fa", fontWeight: 600 }}>🤖 Copilot</span>
                  <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px", color: "#818cf8", fontWeight: 600 }}>🔬 Work IQ</span>
                </div>
              </div>
            )}

            {/* CHAT TAB */}
            {tab === "chat" && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
                  {messages.map(msg => <ChatMessage key={msg.id} msg={msg} text={text} textSub={textSub} textMuted={textMuted} glassBg={glassBg} border={border} dark={dark} cpStep={cpStep} onSend={sendMessage} />)}
                  {typing && (
                    <div style={{ display: "flex", gap: 10, animation: "msgIn 0.4s ease both" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #818cf8, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✦</div>
                      <div>
                        {cpStep >= 0 && <CopilotBar step={cpStep} />}
                        <div style={{ background: glassBg, border: `1px solid ${border}`, borderRadius: "4px 14px 14px 14px", padding: "12px 14px" }}>
                          <TypingIndicator />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                {/* Suggestions */}
                <div style={{ padding: "8px 20px 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    "Continue Hackathon Project",
                    "What did I work on June 14th?",
                    "Why did I get 2nd prize?",
                    "Start Memory Session",
                  ].map(s => (
                    <button key={s} onClick={() => sendMessage(s)} style={{
                      background: glassBg, border: `1px solid ${border}`, borderRadius: 100,
                      padding: "5px 11px", fontSize: 11, color: textSub, cursor: "pointer",
                      fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
                    }}>{s}</button>
                  ))}
                </div>
                <div style={{ padding: "10px 20px 14px", display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <textarea value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                    placeholder="Ask FlowPilot anything…"
                    rows={1}
                    style={{
                      flex: 1, background: glassBg, border: `1px solid ${border}`, borderRadius: 12,
                      padding: "10px 14px", fontSize: 13, color: text, fontFamily: "'Inter', sans-serif",
                      resize: "none", outline: "none", minHeight: 42, maxHeight: 100, lineHeight: 1.5,
                    }} />
                  <button onClick={() => sendMessage(input)} style={{
                    width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    border: "none", cursor: "pointer", fontSize: 16, color: "#fff",
                    boxShadow: "0 4px 15px rgba(99,102,241,0.4)", flexShrink: 0,
                  }}>↑</button>
                </div>
              </div>
            )}

            {/* PROJECTS TAB */}
            {tab === "projects" && (
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: text, marginBottom: 4 }}>📁 All Projects</div>
                <div style={{ fontSize: 12, color: textMuted, marginBottom: 16 }}>5 memory sessions · 2 active</div>
                {PROJECTS.map(p => (
                  <div key={p.id} style={{
                    background: glassBg, border: `1px solid ${border}`, borderRadius: 14,
                    padding: 16, marginBottom: 10, cursor: "pointer",
                  }} onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 22 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: text }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: textMuted }}>Last active: {p.lastActive}</div>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                        padding: "2px 8px", borderRadius: 100,
                        background: p.status === "active" ? "rgba(52,211,153,0.15)" : p.status === "paused" ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
                        color: p.status === "active" ? "#34d399" : p.status === "paused" ? "#fbbf24" : textMuted,
                        border: `1px solid ${p.status === "active" ? "rgba(52,211,153,0.3)" : p.status === "paused" ? "rgba(251,191,36,0.3)" : border}`,
                      }}>{p.status}</span>
                    </div>
                    {/* Progress */}
                    <div style={{ height: 3, background: glassBg, borderRadius: 2, marginBottom: 8, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${p.progress}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}99)`, borderRadius: 2 }} />
                    </div>
                    <div style={{ display: "flex", gap: 12, fontSize: 10, color: textSub }}>
                      <span>📁 {p.files} files</span>
                      <span>🌐 {p.tabs} tabs</span>
                      <span>💡 {p.decisions} decisions</span>
                      <span>✅ {p.done}/{p.tasks}</span>
                    </div>
                    {selectedProject?.id === p.id && (
                      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                        <button onClick={e => { e.stopPropagation(); setTab("chat"); setTimeout(() => sendMessage(`Continue my ${p.name}`), 300); }} style={{
                          flex: 1, padding: "8px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
                          borderRadius: 10, color: "#818cf8", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                        }}>🔄 Restore Context</button>
                        {p.status !== "archived" && (
                          <button onClick={e => { e.stopPropagation(); startRecording(p); }} style={{
                            flex: 1, padding: "8px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: 10, color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter', sans-serif",
                          }}>⏺ Record</button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TIMELINE TAB */}
            {tab === "timeline" && (
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: text, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  📅 Work Timeline · Hackathon Project
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 8, padding: "5px 12px", fontSize: 12, fontWeight: 700, color: "#818cf8" }}>June 14, 2026</div>
                  <div style={{ flex: 1, height: 1, background: border }} />
                </div>
                {TIMELINE_EVENTS.map((ev, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 28 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ev.tagColor, boxShadow: `0 0 10px ${ev.tagColor}80`, flexShrink: 0, marginTop: 4 }} />
                      {i < TIMELINE_EVENTS.length - 1 && <div style={{ width: 1, flex: 1, background: border, minHeight: 20 }} />}
                    </div>
                    <div style={{ flex: 1, background: glassBg, border: `1px solid ${border}`, borderRadius: 12, padding: "10px 12px", marginBottom: 4 }}>
                      <div style={{ fontSize: 10, color: textMuted, marginBottom: 2 }}>{ev.time}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: text, marginBottom: 4 }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: textSub, lineHeight: 1.5 }}>{ev.desc}</div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 7px", borderRadius: 100, marginTop: 6, background: `${ev.tagColor}20`, color: ev.tagColor }}>{ev.tag}</span>
                    </div>
                  </div>
                ))}
                <div style={{
                  background: "linear-gradient(135deg, rgba(0,120,212,0.08), rgba(99,102,241,0.06))",
                  border: "1px solid rgba(0,120,212,0.2)", borderRadius: 12, padding: 12, marginTop: 8,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,120,212,0.8)", marginBottom: 8 }}>🔬 Work IQ · Timeline Intelligence</div>
                  <div style={{ fontSize: 12, color: textSub, lineHeight: 1.6 }}>
                    Copilot detected <strong style={{ color: text }}>3 critical decision points</strong> in this project. The choice to skip the offline-first sync layer (April 8th) is flagged as a potential quality gap based on judging criteria.
                  </div>
                </div>
              </div>
            )}

            {/* RECORDING TAB */}
            {tab === "recording" && recording && (
              <div style={{ padding: "16px 20px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg, rgba(239,68,68,0.1), rgba(220,38,38,0.07))", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#ef4444", boxShadow: "0 0 10px rgba(239,68,68,0.7)", animation: "recPulse 1.5s ease-in-out infinite", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: text }}>{recordingProject?.name}</div>
                    <div style={{ fontSize: 11, color: textMuted }}>Memory session active</div>
                  </div>
                  <button onClick={stopRecording} style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 8, padding: "6px 12px", color: "#f87171", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>Stop</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                  {[
                    { label: "Context", count: 12, detail: "+3 since last session" },
                    { label: "Notes", count: 5, detail: "+2 this session" },
                    { label: "Decisions", count: 3, detail: "Architecture · Track · Stack" },
                    { label: "Tasks", count: 7, detail: "2 completed · 5 pending" },
                  ].map(c => (
                    <div key={c.label} style={{ background: glassBg, border: `1px solid rgba(52,211,153,0.3)`, borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", boxShadow: "0 0 8px #34d399", animation: "liveBlink 2s ease-in-out infinite" }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: textSub }}>{c.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: text, lineHeight: 1.1 }}>{c.count}</div>
                        <div style={{ fontSize: 10, color: textMuted }}>{c.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: textMuted, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  Live Context Feed
                  <span style={{ background: "rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 100, padding: "1px 7px", fontSize: 9, fontWeight: 700, animation: "liveBlink 1.5s ease-in-out infinite" }}>LIVE</span>
                </div>
                {liveFeedItems.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "8px 10px", borderRadius: 8, fontSize: 11, color: textSub, borderBottom: `1px solid ${border}`, animation: "feedIn 0.4s ease both", animationDelay: `${i * 0.05}s` }}>
                    <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>{item.icon}</span>
                    <span style={{ flex: 1, lineHeight: 1.5 }}>{item.text}</span>
                    <span style={{ fontSize: 10, color: textMuted, flexShrink: 0 }}>now</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div style={{
        height: 48, background: panel, backdropFilter: "blur(40px)",
        borderTop: `1px solid ${border}`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexShrink: 0,
      }}>
        {["⊞", "🔍", "🌐", "💼", "📧", "📁", "🎵"].map((icon, i) => (
          <div key={i} style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, cursor: "pointer", fontSize: i === 0 ? 16 : 18 }}>{icon}</div>
        ))}
        <div style={{ width: 1, height: 20, background: border, margin: "0 4px" }} />
        <div onClick={() => { setPanelOpen(!panelOpen); }}
          title="FlowPilot"
          style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#818cf8", cursor: "pointer", fontWeight: 700 }}>✦</div>
        <div style={{ position: "absolute", right: 16, fontSize: 11, color: textMuted, textAlign: "right", lineHeight: 1.4 }}>
          {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}<br />
          {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ p, text, textSub, textMuted, glassBg, border, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: glassBg, border: `1px solid ${border}`, borderRadius: 14,
      padding: 14, marginBottom: 8, cursor: "pointer",
      borderLeft: `3px solid ${p.color}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 16 }}>{p.emoji}</span>
        <span style={{ fontWeight: 600, fontSize: 13, color: text, flex: 1 }}>{p.name}</span>
        <span style={{
          fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
          padding: "2px 8px", borderRadius: 100,
          background: p.status === "active" ? "rgba(52,211,153,0.15)" : p.status === "paused" ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.05)",
          color: p.status === "active" ? "#34d399" : p.status === "paused" ? "#fbbf24" : textMuted,
        }}>{p.status}</span>
      </div>
      <div style={{ fontSize: 11, color: textMuted, marginBottom: 8 }}>Last active: {p.lastActive}</div>
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden", marginTop: 6 }}>
        <div style={{ height: "100%", width: `${p.progress}%`, background: `linear-gradient(90deg, ${p.color}, ${p.color}99)`, borderRadius: 2 }} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 6, fontSize: 10, color: textSub }}>
        <span>📁 {p.files}</span><span>🌐 {p.tabs}</span><span>💡 {p.decisions}</span><span>✅ {p.done}/{p.tasks}</span>
      </div>
    </div>
  );
}

function ChatMessage({ msg, text, textSub, textMuted, glassBg, border, dark, cpStep, onSend }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", flexDirection: "row-reverse", gap: 10, animation: "msgIn 0.4s ease both" }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #374151, #1f2937)", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>👤</div>
        <div style={{ maxWidth: "80%", padding: "12px 14px", background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "14px 4px 14px 14px", fontSize: 13, lineHeight: 1.6, color: text }}>{msg.content}</div>
      </div>
    );
  }

  const aiAvatar = (
    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #818cf8, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, boxShadow: "0 0 15px rgba(99,102,241,0.4)" }}>✦</div>
  );

  if (msg.content === "welcome") {
    return (
      <div style={{ display: "flex", gap: 10, animation: "msgIn 0.5s ease both" }}>
        {aiAvatar}
        <div>
          <div style={{ maxWidth: "80%", padding: "12px 14px", background: glassBg, border: `1px solid ${border}`, borderRadius: "4px 14px 14px 14px", fontSize: 13, lineHeight: 1.6, color: text }}>
            Hi Arul! I'm <strong>FlowPilot</strong>, your personal work-memory companion.<br /><br />
            I remember your work context across sessions — so you never lose your flow. Try:<br />
            <span style={{ color: "#818cf8", cursor: "pointer" }} onClick={() => onSend("Continue my Microsoft Hackathon Project")}>"Continue my Microsoft Hackathon Project"</span>
          </div>
          <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
            <span style={{ background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#60a5fa", fontWeight: 600 }}>🤖 Copilot</span>
            <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#818cf8", fontWeight: 600 }}>🔬 Work IQ</span>
          </div>
        </div>
      </div>
    );
  }

  if (msg.content === "restore") {
    return (
      <div style={{ display: "flex", gap: 10, animation: "msgIn 0.5s ease both" }}>
        {aiAvatar}
        <div style={{ maxWidth: "90%" }}>
          <div style={{ padding: "12px 14px", background: glassBg, border: `1px solid ${border}`, borderRadius: "4px 14px 14px 14px", fontSize: 13, lineHeight: 1.6, color: text }}>
            <strong>🔄 Context Restored — Microsoft Hackathon Project</strong><br />
            <span style={{ fontSize: 11, color: textMuted }}>Session from April 12, 2026 · 47 days ago</span>
            <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${border}`, borderRadius: 10, overflow: "hidden", marginTop: 12 }}>
              <div style={{ padding: "8px 12px", background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))", borderBottom: `1px solid ${border}`, fontSize: 11, fontWeight: 600, color: "#818cf8" }}>⚡ Restoring Workspace…</div>
              <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                {["Project Summary", "Browser Tabs · 8 restored", "Files · 23 tracked", "Unfinished Tasks · 6 pending", "Key Decisions · 11 recalled"].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: textSub, padding: "5px 8px", background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, animation: "feedIn 0.4s ease both", animationDelay: `${i * 0.1}s` }}>
                    <span style={{ color: "#34d399" }}>✓</span>
                    <span style={{ flex: 1 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#818cf8", marginBottom: 6 }}>📋 Unfinished Tasks from April 12th</div>
              {["Implement offline-first sync layer", "Add voice activation (Hey FlowPilot)", "Finalize Copilot reasoning pipeline demo", "Write Enterprise security documentation", "Prepare keynote slide deck for demo", "User testing with 3 pilot participants"].map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4, fontSize: 11, color: textSub }}>
                  <span style={{ color: "#6366f1", flexShrink: 0 }}>→</span>{t}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: textMuted, marginTop: 8 }}>You are back where you left off. FlowPilot has your complete context. 🧠</div>
          </div>
          <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
            <span style={{ background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#60a5fa", fontWeight: 600 }}>🤖 Copilot Restored</span>
            <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#818cf8", fontWeight: 600 }}>🔬 Work IQ</span>
          </div>
        </div>
      </div>
    );
  }

  if (msg.content === "june14") {
    return (
      <div style={{ display: "flex", gap: 10, animation: "msgIn 0.5s ease both" }}>
        {aiAvatar}
        <div style={{ maxWidth: "90%" }}>
          <div style={{ padding: "12px 14px", background: glassBg, border: `1px solid ${border}`, borderRadius: "4px 14px 14px 14px", fontSize: 13, color: text }}>
            <strong>📅 June 14, 2026 — Work Summary</strong>
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "10px 12px", marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#818cf8", marginBottom: 6 }}>⏱ Timeline</div>
              {[["09:12", "Resumed FlowPilot Prototype session"], ["10:48", "Decided on Work IQ ↔ Copilot architecture"], ["11:30", "Analyzed hackathon judging criteria"], ["14:15", "Implemented flowpilot-core.ts (+187 lines)"], ["16:00", "Session paused — context saved"]].map(([t, d], i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11, color: textSub }}>
                  <span style={{ color: "#6366f1", flexShrink: 0, minWidth: 35 }}>{t}</span>{d}
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", marginBottom: 6 }}>💡 Decisions Made</div>
              {["Use Work IQ as memory abstraction layer", "Innovation narrative needs strengthening (25% weight)", "Glassmorphism + Fluent Design system selected"].map((d, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11, color: textSub }}>
                  <span style={{ color: "#fbbf24", flexShrink: 0 }}>✓</span>{d}
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#34d399", marginBottom: 6 }}>✅ 3 Completed · 6 Remaining</div>
              {[["✓", "Architecture diagram designed", "#34d399"], ["✓", "Core memory engine v1 complete", "#34d399"], ["○", "Voice activation (unfinished)", textMuted]].map(([icon, t, c], i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11, color: textSub }}>
                  <span style={{ color: c, flexShrink: 0 }}>{icon}</span>{t}
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#818cf8", fontWeight: 600 }}>🔬 Work IQ Timeline</span>
          </div>
        </div>
      </div>
    );
  }

  if (msg.content === "whyPrize") {
    return (
      <div style={{ display: "flex", gap: 10, animation: "msgIn 0.5s ease both" }}>
        {aiAvatar}
        <div style={{ maxWidth: "90%" }}>
          <div style={{ padding: "12px 14px", background: glassBg, border: `1px solid ${border}`, borderRadius: "4px 14px 14px 14px", fontSize: 13, color: text }}>
            <strong>🔍 Root Cause Analysis — Why 2nd Prize?</strong><br />
            <span style={{ fontSize: 11, color: textMuted }}>Powered by Microsoft Copilot · 47 days analyzed</span>
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 12px", marginTop: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#f87171", marginBottom: 6 }}>❌ Root Causes</div>
              {WHY_ANALYSIS.filter(a => a.type === "cause").map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6, fontSize: 11, color: textSub }}>
                  <span style={{ color: "#f87171", flexShrink: 0 }}>•</span><span style={{ lineHeight: 1.5 }}>{a.text}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#fbbf24", marginBottom: 6 }}>💡 Missed Opportunities</div>
              {WHY_ANALYSIS.filter(a => a.type === "opportunity").map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5, fontSize: 11, color: textSub }}>
                  <span style={{ color: "#fbbf24", flexShrink: 0 }}>→</span><span style={{ lineHeight: 1.5 }}>{a.text}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 10, padding: "10px 12px", marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#34d399", marginBottom: 6 }}>✅ Next Actions to Win</div>
              {WHY_ANALYSIS.filter(a => a.type === "action").map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 5, fontSize: 11, color: textSub }}>
                  <span style={{ color: "#34d399", flexShrink: 0 }}>{i + 1}.</span><span style={{ lineHeight: 1.5 }}>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginTop: 4, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(0,120,212,0.1)", border: "1px solid rgba(0,120,212,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#60a5fa", fontWeight: 600 }}>🤖 Copilot Analysis</span>
            <span style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 100, padding: "3px 10px", fontSize: 10, color: "#818cf8", fontWeight: 600 }}>🔬 Work IQ</span>
            <span style={{ background: "rgba(255,255,255,0.05)", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 100, padding: "3px 10px", fontSize: 10, color: textMuted, fontWeight: 600 }}>47 days analyzed</span>
          </div>
        </div>
      </div>
    );
  }

  if (msg.content === "generic") {
    return (
      <div style={{ display: "flex", gap: 10, animation: "msgIn 0.5s ease both" }}>
        {aiAvatar}
        <div style={{ maxWidth: "80%", padding: "12px 14px", background: glassBg, border: `1px solid ${border}`, borderRadius: "4px 14px 14px 14px", fontSize: 13, lineHeight: 1.6, color: text }}
          dangerouslySetInnerHTML={{ __html: msg.text?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      </div>
    );
  }

  return null;
}
