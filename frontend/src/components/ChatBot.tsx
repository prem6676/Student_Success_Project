import { useState, useRef, useEffect } from "react";

const ROBOT_IMG = "data:image/png;base64,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";

// Map keywords to resource IDs in Resources.tsx
const RESOURCE_KEYWORDS: Record<string, string> = {
  java: "java",
  spring: "java",
  jvm: "java",
  python: "python",
  django: "python",
  flask: "python",
  fastapi: "python",
  dsa: "dsa",
  "data structure": "dsa",
  algorithm: "dsa",
  leetcode: "dsa",
  "dynamic programming": "dsa",
  graph: "dsa",
  tree: "dsa",
  web: "webdev",
  react: "webdev",
  html: "webdev",
  css: "webdev",
  javascript: "webdev",
  typescript: "webdev",
  "node.js": "webdev",
  nodejs: "webdev",
  sql: "database",
  database: "database",
  mongodb: "database",
  postgresql: "database",
  mysql: "database",
  redis: "database",
  "data science": "datascience",
  "machine learning": "datascience",
  ml: "datascience",
  pandas: "datascience",
  numpy: "datascience",
  tensorflow: "datascience",
  kaggle: "datascience",
  devops: "devops",
  docker: "devops",
  kubernetes: "devops",
  aws: "devops",
  linux: "devops",
  "ci/cd": "devops",
  cloud: "devops",
  security: "cybersecurity",
  cybersecurity: "cybersecurity",
  hacking: "cybersecurity",
  owasp: "cybersecurity",
  mobile: "mobile",
  android: "mobile",
  ios: "mobile",
  flutter: "mobile",
  "react native": "mobile",
  kotlin: "mobile",
};

function detectResourceId(text: string): string | null {
  const lower = text.toLowerCase();
  for (const [keyword, id] of Object.entries(RESOURCE_KEYWORDS)) {
    if (lower.includes(keyword)) return id;
  }
  return null;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  resourceId?: string | null; // triggers a "Go to Resources" button
}

interface ChatBotProps {
  onNavigateToResources?: (resourceId: string) => void;
}

export default function ChatBot({ onNavigateToResources }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your AI assistant 🤖 I can help you with resume analysis, skill assessments, interview prep, and learning resources. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) inputRef.current?.focus();
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("http://127.0.0.1:8000/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      const assistantContent = data?.content || "Sorry, I couldn't process that. Please try again.";

      // Detect if user asked about a resource topic
      const resourceId = detectResourceId(trimmed);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantContent,
        timestamp: new Date(),
        resourceId,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "⚠️ Something went wrong. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const formatMessage = (text: string) =>
    text.split("\n").map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));

  const resourceLabels: Record<string, string> = {
    java: "Java Programming",
    python: "Python Development",
    dsa: "DSA",
    webdev: "Web Development",
    database: "Database",
    datascience: "Data Science & ML",
    devops: "DevOps & Cloud",
    cybersecurity: "Cybersecurity",
    mobile: "Mobile Development",
  };

  return (
    <>
      {/* Floating Robot Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        style={{ background: "transparent", boxShadow: "0 8px 32px rgba(99,102,241,0.45)", padding: 0 }}
        aria-label="Open AI Chatbot"
      >
        <span className="absolute w-full h-full rounded-full animate-ping opacity-25"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }} />
        <img src={ROBOT_IMG} alt="AI Chatbot"
          className="w-16 h-16 rounded-full object-cover relative z-10"
          style={{ filter: "drop-shadow(0 4px 12px rgba(99,102,241,0.6))" }} />
        {!isOpen && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold z-20">
            {messages.filter((m) => m.role === "assistant").length > 9
              ? "9+" : messages.filter((m) => m.role === "assistant").length}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 flex flex-col rounded-2xl overflow-hidden transition-all duration-300"
          style={{
            width: "360px",
            height: isMinimized ? "60px" : "520px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            background: "#0f0f1a",
            border: "1px solid rgba(99,102,241,0.3)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)" }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <img src={ROBOT_IMG} alt="AI" className="w-9 h-9 rounded-full object-cover"
                style={{ border: "2px solid rgba(255,255,255,0.4)" }} />
              <div>
                <p className="text-white font-semibold text-sm leading-none">AI Assistant</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <p className="text-white/80 text-xs">Online</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMessages([{
                    id: "welcome", role: "assistant",
                    content: "Hi! I'm your AI assistant 🤖 Chat cleared! How can I help you?",
                    timestamp: new Date(),
                  }]);
                }}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
                title="Clear chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
                title="Close"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "#6366f1 transparent" }}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <img src={ROBOT_IMG} alt="AI"
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 mt-1" />
                    )}
                    <div className="max-w-[78%]">
                      <div
                        className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                        style={msg.role === "user"
                          ? { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "white", borderBottomRightRadius: "4px" }
                          : { background: "rgba(255,255,255,0.07)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.1)", borderBottomLeftRadius: "4px" }
                        }
                      >
                        {formatMessage(msg.content)}
                      </div>

                      {/* Resource navigation button */}
                      {msg.role === "assistant" && msg.resourceId && onNavigateToResources && (
                        <button
                          onClick={() => {
                            onNavigateToResources(msg.resourceId!);
                            setIsOpen(false);
                          }}
                          className="mt-2 w-full text-xs px-3 py-2 rounded-xl flex items-center justify-between gap-2 transition-all hover:scale-105"
                          style={{
                            background: "linear-gradient(135deg, #6366f120, #8b5cf620)",
                            border: "1px solid rgba(99,102,241,0.4)",
                            color: "#a5b4fc",
                          }}
                        >
                          <span>📚 View {resourceLabels[msg.resourceId] || "Resources"} on Resources page</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}

                      <p className="text-xs mt-1 px-1" style={{ color: "#4b5563" }}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <img src={ROBOT_IMG} alt="AI"
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0 mr-2 mt-1" />
                    <div className="px-4 py-3 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderBottomLeftRadius: "4px" }}>
                      <div className="flex gap-1 items-center">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
                            style={{ background: "#6366f1", animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                  {["Java resources", "DSA practice", "Mock interview tips", "Resume help"].map((s) => (
                    <button key={s}
                      onClick={() => { setInput(s); inputRef.current?.focus(); }}
                      className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-105"
                      style={{ borderColor: "rgba(99,102,241,0.4)", color: "#a5b4fc", background: "rgba(99,102,241,0.1)" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="px-3 py-3 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-end gap-2 rounded-xl px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(99,102,241,0.3)" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm resize-none outline-none py-1"
                    style={{ color: "#e2e8f0", maxHeight: "80px", scrollbarWidth: "none" }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: input.trim() ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(255,255,255,0.1)" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
                <p className="text-center text-xs mt-2" style={{ color: "#374151" }}>
                  Press Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
