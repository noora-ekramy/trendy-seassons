"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const locale = useLocale();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stickToBottom, setStickToBottom] = useState(true);
  const messagesViewportRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!stickToBottom) return;
    const last = messages[messages.length - 1];
    const behavior: ScrollBehavior = last?.streaming ? "auto" : "smooth";
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior, block: "end", inline: "nearest" });
    });
  }, [messages, stickToBottom]);

  useEffect(() => {
    if (!loading) textareaRef.current?.focus();
  }, [loading]);

  function updateStickToBottom() {
    const el = messagesViewportRef.current;
    if (!el) return;
    const thresholdPx = 80;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setStickToBottom(distanceFromBottom < thresholdPx);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setError(null);
    setStickToBottom(true);
    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    queueMicrotask(() => textareaRef.current?.focus());

    try {
      const conversationForApi = [...messages, userMsg];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversationForApi.map((m) => ({ role: m.role, content: m.content })),
          locale,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || "Request failed");
      }

      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === "assistant" && last.streaming) {
            copy[copy.length - 1] = { ...last, content: full };
          }
          return copy;
        });
      }

      setMessages((prev) => {
        const copy = [...prev];
        const last = copy[copy.length - 1];
        if (last?.role === "assistant" && last.streaming) {
          copy[copy.length - 1] = { ...last, content: last.content, streaming: false };
        }
        return copy;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : t("error");
      setError(msg);
      setMessages((prev) =>
        prev.map((m) => (m.streaming ? { ...m, content: t("error"), streaming: false } : m))
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <StorefrontShell>
      <section className="bg-gradient-to-b from-primary/10 to-background py-8 text-center">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-6">
        <Card className="border border-secondary bg-white shadow-sm overflow-hidden">
          <CardContent className="p-0">
            {/* Messages */}
            <div
              ref={messagesViewportRef}
              onScroll={updateStickToBottom}
              className="min-h-[200px] max-h-[60vh] overflow-y-auto p-4 space-y-4 bg-[#FAFAFA]/50 overscroll-contain"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                  <Bot className="h-12 w-12 mb-4 text-primary/60" />
                  <p className="text-sm">{t("placeholder")}</p>
                  <p className="mt-2 text-xs">{locale === "ar" ? "اكتب إنجليزي أو عربي" : "Type in English or Egyptian Arabic"}</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      m.role === "user"
                        ? "bg-primary text-white"
                        : "bg-white border border-secondary text-foreground"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      m.streaming && !m.content ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-sm">{t("thinking")}</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-pulse" />
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-pulse [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-pulse [animation-delay:300ms]" />
                          </span>
                        </div>
                      ) : (
                        <div
                          className="markdown-content break-words"
                          dir={/[\u0600-\u06FF]/.test(m.content) ? "rtl" : undefined}
                        >
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="my-2 leading-relaxed">{children}</p>,
                              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              ul: ({ children }) => <ul className="my-2 list-disc list-inside space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="my-2 list-decimal list-inside space-y-1">{children}</ol>,
                              li: ({ children }) => <li className="ml-4">{children}</li>,
                              code: ({ children, className }) => {
                                const isInline = !className;
                                return isInline ? (
                                  <code className="bg-secondary text-primary px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                                ) : (
                                  <code className={className}>{children}</code>
                                );
                              },
                              pre: ({ children }) => (
                                <pre className="bg-secondary border border-secondary rounded-lg p-3 overflow-x-auto my-2">
                                  {children}
                                </pre>
                              ),
                              h1: ({ children }) => <h1 className="text-xl font-semibold text-foreground mt-4 mb-2">{children}</h1>,
                              h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mt-3 mb-2">{children}</h2>,
                              h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mt-2 mb-1">{children}</h3>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-primary pl-4 my-2 italic text-foreground/80">
                                  {children}
                                </blockquote>
                              ),
                              a: ({ href, children }) => (
                                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <p className="whitespace-pre-wrap break-words">
                        {m.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-secondary p-4 bg-white">
              {error && (
                <p className="text-sm text-red-600 mb-2">{error}</p>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t("placeholder")}
                  rows={1}
                  className="min-h-[48px] max-h-32 resize-none border-secondary focus:border-primary py-3"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !loading &&
                      !(e.nativeEvent as KeyboardEvent).isComposing
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="shrink-0 h-12 px-4 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </StorefrontShell>
  );
}
