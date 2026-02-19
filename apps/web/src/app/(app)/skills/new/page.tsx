"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function NewSkillPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startWizard(intent: string) {
    setLoading(true);
    try {
      const res = await api.post("/wizard/start", { intent });
      setSessionId(res.data.sessionId);
      setMessages([
        { role: "user", content: intent },
        { role: "assistant", content: res.data.message },
      ]);
    } catch (err) {
      console.error("Failed to start wizard:", err);
    } finally {
      setLoading(false);
    }
  }

  async function sendMessage(message: string) {
    if (!sessionId) {
      await startWizard(message);
      return;
    }
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setLoading(true);
    try {
      const res = await api.post(`/wizard/${sessionId}/message`, { message });
      setMessages((prev) => [...prev, { role: "assistant", content: res.data.message }]);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col px-6 py-8" style={{ height: "calc(100vh - 57px)" }}>
      <h1 className="mb-4 text-2xl font-bold">Create a New Skill</h1>

      <div className="flex-1 overflow-y-auto rounded-xl border bg-white p-6">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>Describe the skill you want to create to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-500">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What should this skill enable an AI agent to do?"
          className="flex-1 rounded-lg border px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" disabled={loading} />
        <button type="submit" disabled={loading || !input.trim()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
