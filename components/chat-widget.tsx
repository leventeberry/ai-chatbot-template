'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "system";
  content: string;
};

type WidgetConfig = {
  id: string;
  name: string;
  allowed_origin: string;
  config: string;
};

type WidgetTheme = {
  headerBackground?: string;
  headerText?: string;
  buttonBackground?: string;
  buttonText?: string;
};

type WidgetBranding = {
  logoUrl?: string;
  showLogo?: boolean;
  avatarUrl?: string;
};

type WidgetPlacement = {
  position?: "bottom-right" | "bottom-left";
  offsetX?: number;
  offsetY?: number;
};

type WidgetGreeting = {
  welcomeMessage?: string;
  initialPrompt?: string;
};

type WidgetBehavior = {
  openOnLoad?: boolean;
  showOnline?: boolean;
};

const FALLBACK_ERROR_MESSAGE =
  "Sorry, I'm having trouble connecting to the AI.";
const HISTORY_CACHE_KEY = "chatbot-history";
const WIDGET_CONFIG_CACHE_KEY = "chatbot-widget-config";
const WIDGET_AUTH_TOKEN = process.env.NEXT_PUBLIC_WIDGET_TOKEN;
const DEFAULT_WIDGET_TITLE = "Chexi AI Assistant";
const DEFAULT_WELCOME_MESSAGE = "I am here to help answer your questions. Ask me anything!";
const GLOBAL_ASSISTANT_AVATAR_URL =
  process.env.NEXT_PUBLIC_CHEXI_AVATAR_URL || "";

type ChatWidgetProps = {
  widgetId?: string | null;
  token?: string | null;
  origin?: string | null;
};

export function ChatWidget({ token, origin }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [widgetTitle, setWidgetTitle] = useState(DEFAULT_WIDGET_TITLE);
  const [widgetTheme, setWidgetTheme] = useState<WidgetTheme | null>(null);
  const [widgetBranding, setWidgetBranding] = useState<WidgetBranding | null>(null);
  const [widgetPlacement, setWidgetPlacement] = useState<WidgetPlacement | null>(
    null
  );
  const [widgetGreeting, setWidgetGreeting] = useState<WidgetGreeting | null>(
    null
  );
  const [widgetBehavior, setWidgetBehavior] = useState<WidgetBehavior | null>(
    null
  );
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistorySync, setShowHistorySync] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasHydratedHistoryRef = useRef(false);
  const hasAutoOpenedRef = useRef(false);

  const assistantAvatarUrl = GLOBAL_ASSISTANT_AVATAR_URL || undefined;
  const resolvedToken = token?.trim() || WIDGET_AUTH_TOKEN || undefined;
  const resolvedOrigin = origin?.trim() || undefined;
  const requestHeaders = useMemo(() => {
    if (!resolvedToken && !resolvedOrigin) return undefined;
    return {
      ...(resolvedToken ? { Authorization: `Bearer ${resolvedToken}` } : {}),
      ...(resolvedOrigin ? { "X-Widget-Origin": resolvedOrigin } : {}),
    };
  }, [resolvedOrigin, resolvedToken]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen, isSending]);

  useEffect(() => {
    if (!isOpen) return;

    const loadConfig = async () => {
      const cached = getCachedWidgetConfig();
      if (cached) {
        const parsed = resolveWidgetConfig(cached);
        setWidgetTitle(parsed.title);
        setWidgetTheme(parsed.theme);
        setWidgetBranding(parsed.branding);
        setWidgetPlacement(parsed.placement);
        setWidgetGreeting(parsed.greeting);
        setWidgetBehavior(parsed.behavior);
      }

      try {
        const res = await fetch("/api/v1/widget/config", {
          headers: requestHeaders,
        });
        if (!res.ok) throw new Error("Failed to fetch widget config.");
        const data = (await res.json()) as WidgetConfig;
        cacheWidgetConfig(data);
        const parsed = resolveWidgetConfig(data);
        setWidgetTitle(parsed.title);
        setWidgetTheme(parsed.theme);
        setWidgetBranding(parsed.branding);
        setWidgetPlacement(parsed.placement);
        setWidgetGreeting(parsed.greeting);
        setWidgetBehavior(parsed.behavior);
      } catch {
        setWidgetTitle(DEFAULT_WIDGET_TITLE);
        setWidgetTheme(null);
        setWidgetBranding(null);
        setWidgetPlacement(null);
        setWidgetGreeting(null);
        setWidgetBehavior(null);
      }
    };

    void loadConfig();
  }, [isOpen, requestHeaders]);

  useEffect(() => {
    if (hasAutoOpenedRef.current) return;
    if (widgetBehavior?.openOnLoad) {
      setIsOpen(true);
      hasAutoOpenedRef.current = true;
    }
  }, [widgetBehavior]);

  useEffect(() => {
    if (!isOpen || sessionId) return;

    const createSession = async () => {
      try {
        const res = await fetch("/api/v1/widget/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(requestHeaders || {}),
          },
        });
        if (!res.ok) throw new Error("Failed to create session.");
        const data = (await res.json()) as { session_id: string };
        setSessionId(data.session_id || "default");
      } catch {
        setSessionId("default");
      }
    };

    void createSession();
  }, [isOpen, requestHeaders, sessionId]);

  useEffect(() => {
    if (!isOpen || messages.length > 0 || !sessionId) return;

    const loadHistory = async () => {
      let hadCache = false;
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem(HISTORY_CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as ChatMessage[];
            if (Array.isArray(parsed)) {
              setMessages(parsed);
              hadCache = parsed.length > 0;
            }
          } catch {
            sessionStorage.removeItem(HISTORY_CACHE_KEY);
          }
        }
      }

      if (!hasHydratedHistoryRef.current && !hadCache) {
        setShowHistorySync(true);
      }
      setIsHistoryLoading(true);
      try {
        const res = await fetch(
          `/api/v1/chat/history?session_id=${encodeURIComponent(sessionId)}`,
          {
            credentials: "include",
            headers: requestHeaders,
          }
        );
        if (!res.ok) throw new Error("Failed to fetch chat history.");
        const data = (await res.json()) as { role: string; content: string }[];
        const normalized = data.map((item, index) => {
          const role: ChatMessage["role"] =
            item.role === "assistant" || item.role === "system"
              ? item.role
              : "user";
          return {
            id: index,
            role,
            content: item.content,
          };
        });
        setMessages(normalized);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(
            HISTORY_CACHE_KEY,
            JSON.stringify(normalized)
          );
        }
      } catch {
        setMessages([]);
      } finally {
        setIsHistoryLoading(false);
        setShowHistorySync(false);
        hasHydratedHistoryRef.current = true;
      }
    };

    void loadHistory();
  }, [isOpen, messages.length, requestHeaders, sessionId]);

  useEffect(() => {
    if (!isOpen || typeof window === "undefined") return;
    sessionStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(messages));
  }, [isOpen, messages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    const optimisticUserMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch("/api/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(requestHeaders || {}),
        },
        credentials: "include",
        body: JSON.stringify({
          message: trimmed,
          session_id: sessionId ?? "default",
        }),
      });

      if (!res.ok) throw new Error("Failed to send message.");
      const data = (await res.json()) as { role: string; content: string };
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.content,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: FALLBACK_ERROR_MESSAGE,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      className="fixed z-50 flex flex-col items-end gap-4 font-sans"
      style={resolveWidgetPlacement(widgetPlacement)}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 w-full h-full bg-background border border-border/50 shadow-2xl flex flex-col overflow-hidden md:static md:w-[380px] md:h-[600px] md:max-h-[80vh] md:rounded-2xl"
          >
            <div
              className="bg-gradient-to-r from-primary to-purple-600 p-4 flex items-center justify-between shrink-0"
              style={resolveHeaderStyle(widgetTheme)}
            >
              <div className="flex items-center gap-3 text-primary-foreground">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  {widgetBranding?.logoUrl && widgetBranding.showLogo !== false ? (
                    <Image
                      src={widgetBranding.logoUrl}
                      alt="Logo"
                      width={24}
                      height={24}
                      sizes="24px"
                      unoptimized
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <Bot className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight font-display">
                    {widgetTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 opacity-90">
                    {widgetBehavior?.showOnline !== false && (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs font-medium">Online</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                aria-label="Close chat widget"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin bg-slate-50/50 dark:bg-slate-900/50"
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Welcome!
                    </h4>
                    <p className="text-sm">
                      {widgetGreeting?.welcomeMessage || DEFAULT_WELCOME_MESSAGE}
                    </p>
                  </div>
                  {showHistorySync && isHistoryLoading && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Syncing history...</span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const isAi = msg.role === "assistant" || msg.role === "system";
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={msg.id}
                        className={cn(
                          "flex w-full gap-3",
                          isAi ? "justify-start" : "justify-end"
                        )}
                      >
                        {isAi && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1 overflow-hidden">
                            {assistantAvatarUrl ? (
                              <Image
                                src={assistantAvatarUrl}
                                alt="Assistant avatar"
                                width={32}
                                height={32}
                                sizes="32px"
                                unoptimized
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Bot className="w-5 h-5" />
                            )}
                          </div>
                        )}

                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl p-3.5 text-sm shadow-sm",
                            isAi
                              ? "bg-white dark:bg-card border border-border text-foreground rounded-tl-none"
                              : "bg-primary text-primary-foreground rounded-tr-none"
                          )}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </div>

                        {!isAi && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {isSending && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex w-full gap-3 justify-start"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-white dark:bg-card border border-border rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 bg-background border-t border-border">
              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-muted/50 rounded-xl p-1.5 border border-transparent focus-within:border-primary/30 focus-within:bg-background focus-within:shadow-md transition-all duration-200"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none placeholder:text-muted-foreground/70"
                  aria-label="Message input"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isSending}
                  className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <div className="text-center mt-2">
                <p className="text-[10px] text-muted-foreground">
                  Powered by AI • May produce inaccurate information
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-colors duration-300",
          isOpen
            ? "bg-muted text-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        style={resolveButtonStyle(widgetTheme)}
        aria-label={isOpen ? "Close chat widget" : "Open chat widget"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-7 h-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

function resolveWidgetConfig(config: WidgetConfig): {
  title: string;
  theme: WidgetTheme | null;
  branding: WidgetBranding | null;
  placement: WidgetPlacement | null;
  greeting: WidgetGreeting | null;
  behavior: WidgetBehavior | null;
} {
  const fallbackTitle = config?.name?.trim() || DEFAULT_WIDGET_TITLE;
  const raw = config?.config ?? "";
  if (!raw.trim()) {
    return {
      title: fallbackTitle,
      theme: null,
      branding: null,
      placement: null,
      greeting: null,
      behavior: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as {
      title?: string;
      theme?: WidgetTheme;
      branding?: WidgetBranding;
      placement?: WidgetPlacement;
      greeting?: WidgetGreeting;
      behavior?: WidgetBehavior;
    };
    const resolvedTitle =
      typeof parsed.title === "string" && parsed.title.trim()
        ? parsed.title.trim()
        : fallbackTitle;
    return {
      title: resolvedTitle,
      theme: parsed?.theme ?? null,
      branding: parsed?.branding ?? null,
      placement: parsed?.placement ?? null,
      greeting: parsed?.greeting ?? null,
      behavior: parsed?.behavior ?? null,
    };
  } catch {
    return {
      title: fallbackTitle,
      theme: null,
      branding: null,
      placement: null,
      greeting: null,
      behavior: null,
    };
  }
}

function getCachedWidgetConfig(): WidgetConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(WIDGET_CONFIG_CACHE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WidgetConfig;
  } catch {
    localStorage.removeItem(WIDGET_CONFIG_CACHE_KEY);
    return null;
  }
}

function cacheWidgetConfig(config: WidgetConfig) {
  if (typeof window === "undefined") return;
  localStorage.setItem(WIDGET_CONFIG_CACHE_KEY, JSON.stringify(config));
}

function resolveHeaderStyle(theme: WidgetTheme | null): CSSProperties | undefined {
  if (!theme) return undefined;
  if (!theme.headerBackground && !theme.headerText) return undefined;
  return {
    background: theme.headerBackground,
    color: theme.headerText,
  };
}

function resolveButtonStyle(theme: WidgetTheme | null): CSSProperties | undefined {
  if (!theme) return undefined;
  if (!theme.buttonBackground && !theme.buttonText) return undefined;
  return {
    background: theme.buttonBackground,
    color: theme.buttonText,
  };
}

function resolveWidgetPlacement(placement: WidgetPlacement | null): CSSProperties {
  const position = placement?.position ?? "bottom-right";
  const offsetX = placement?.offsetX ?? 24;
  const offsetY = placement?.offsetY ?? 24;
  return {
    bottom: offsetY,
    right: position === "bottom-right" ? offsetX : "auto",
    left: position === "bottom-left" ? offsetX : "auto",
  };
}
