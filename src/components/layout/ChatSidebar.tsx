"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, LogIn } from "lucide-react";
import type { ChatMsg } from "@/types";
import Link from "next/link";

const COLORS = [
  "text-cyan",
  "text-amber",
  "text-gain",
  "text-[oklch(0.6_0.2_290)]",
  "text-[oklch(0.7_0.15_30)]",
];

function getUserColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export function ChatSidebar() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });
      if (res.ok) {
        setInput("");
        fetchMessages();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-cyan text-navy flex items-center justify-center shadow-lg hover:bg-cyan/90 transition-all glow-cyan lg:hidden"
        >
          <MessageCircle className="h-5 w-5" />
        </button>
      )}

      <aside
        className={`${
          isOpen ? "fixed inset-0 z-50 lg:relative lg:inset-auto" : "hidden lg:block"
        } lg:w-72 xl:w-80 border-l border-border/50 bg-navy flex flex-col`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-gain animate-pulse-dot" />
            <span className="text-sm font-semibold">Global Chat</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No messages yet. Start the conversation!
              </p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-xs font-semibold ${getUserColor(msg.userId)}`}
                  >
                    {msg.displayName}
                  </span>
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border/50">
          {user ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-secondary/50 border border-border/50 rounded-md px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-cyan/50"
                maxLength={500}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || sending}
                className="bg-cyan text-navy hover:bg-cyan/90 h-8 w-8 p-0"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2 text-sm text-cyan hover:text-cyan/80 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Login to chat
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
