"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { DumbbellIcon } from "./dumbbell-icon";

type Role = "user" | "assistant";

type Message = {
  id: string;
  role: Role;
  content: string;
};

const STORAGE_KEY = "workout-chat:messages";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/chat";

const SUGGESTIONS = [
  "What is my best squat weight and for how many reps?",
  "How many workouts did I log last month?",
  "Show my bench press progress over time.",
  "Which muscle group do I train most?",
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw) as Message[]);
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages, hydrated]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = (await res.json()) as { reply: string };
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            err instanceof Error
              ? `Error: ${err.message}`
              : "Something went wrong.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    void sendMessage(input);
  }

  function clearChat() {
    setMessages([]);
  }

  const hasChat = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
              <DumbbellIcon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Workout Stats Chat
            </span>
          </div>
          {hasChat && (
            <button
              type="button"
              onClick={clearChat}
              className="text-xs text-muted hover:text-foreground transition-colors"
            >
              Clear chat
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto"
        >
          <div className="mx-auto w-full max-w-3xl px-4 py-8">
            {!hasChat ? (
              <Hero onPick={(s) => void sendMessage(s)} />
            ) : (
              <ul className="flex flex-col gap-5">
                {messages.map((m) => (
                  <MessageBubble key={m.id} message={m} />
                ))}
                {isSending && <TypingIndicator />}
              </ul>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-border bg-background/80 backdrop-blur-md">
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-4"
          >
            <div className="flex flex-1 items-end rounded-2xl border border-border bg-surface px-4 py-3 focus-within:border-accent/60 transition-colors">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                rows={1}
                placeholder="Ask about your workouts…"
                className="flex-1 resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-muted max-h-40"
                disabled={isSending}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="grid h-11 w-11 place-items-center rounded-2xl bg-accent text-background transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-surface-elevated disabled:text-muted"
              aria-label="Send message"
            >
              <SendIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

function Hero({ onPick }: { onPick: (text: string) => void }) {
  return (
    <section className="flex flex-col items-center gap-8 py-16 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent ring-1 ring-accent/30">
        <DumbbellIcon className="h-9 w-9" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Ask about your workouts
        </h1>
        <p className="max-w-md text-base leading-7 text-muted">
          Your lifting history, analyzed. Query personal records, volume,
          frequency, and progress in plain English.
        </p>
      </div>
      <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-surface px-4 py-3 text-left text-sm text-foreground/90 transition-colors hover:border-accent/50 hover:bg-surface-elevated"
          >
            {s}
          </button>
        ))}
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <li className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${
          isUser
            ? "bg-accent text-background"
            : "border border-border bg-surface text-foreground"
        }`}
      >
        {message.content}
      </div>
    </li>
  );
}

function TypingIndicator() {
  return (
    <li className="flex justify-start">
      <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-3">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
        <span
          className="typing-dot h-1.5 w-1.5 rounded-full bg-muted"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="typing-dot h-1.5 w-1.5 rounded-full bg-muted"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </li>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
