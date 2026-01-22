"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { buildEmbedSnippet } from "@/components/dashboard/dashboard-helpers"

export type DashboardSection =
  | "overview"
  | "settings"
  | "tokens"
  | "analytics"
  | "conversations"

type WidgetConfig = {
  title?: string
  theme?: {
    headerBackground?: string
    headerText?: string
    buttonBackground?: string
    buttonText?: string
  }
  branding?: {
    logoUrl?: string
    showLogo?: boolean
  }
  placement?: {
    position?: "bottom-right" | "bottom-left"
    offsetX?: number
    offsetY?: number
  }
  greeting?: {
    welcomeMessage?: string
    initialPrompt?: string
  }
  behavior?: {
    openOnLoad?: boolean
    showOnline?: boolean
  }
  systemPrompt?: string
  documentation?: string
}

type Widget = {
  id: string
  name: string
  allowed_origin: string
  config: string
  updated_at: string
}

export type TokenSummary = {
  id: string
  name: string
  created_at: string
  last_used_at?: string | null
}

type Analytics = {
  widget_id: string
  messages: { total: number; user: number; assistant: number }
  sessions: { total: number; today: number }
  tokens: TokenSummary[]
  last_chat_at?: string | null
  per_domain: { origin: string; sessions: number; messages: number }[]
}

type ConversationSummary = {
  id: string
  session_id: string
  origin: string
  created_at: string
  message_count: number
}

type ConversationMessage = {
  id: string
  role: string
  content: string
  created_at: string
}

const AUTH_TOKEN_KEY = "auth_token"
const AUTH_TENANT_KEY = "auth_tenant_id"
const AUTH_WIDGET_KEY = "auth_widget_id"

export function useDashboardData(section: DashboardSection) {
  const router = useRouter()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const [widgetName, setWidgetName] = useState("")
  const [allowedOrigin, setAllowedOrigin] = useState("")

  const [headerBackground, setHeaderBackground] = useState("#4f46e5")
  const [headerText, setHeaderText] = useState("#ffffff")
  const [buttonBackground, setButtonBackground] = useState("#4f46e5")
  const [buttonText, setButtonText] = useState("#ffffff")
  const [logoUrl, setLogoUrl] = useState("")
  const [showLogo, setShowLogo] = useState(true)
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(
    "bottom-right"
  )
  const [offsetX, setOffsetX] = useState(24)
  const [offsetY, setOffsetY] = useState(24)
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Welcome! How can we help?"
  )
  const [initialPrompt, setInitialPrompt] = useState("")
  const [openOnLoad, setOpenOnLoad] = useState(false)
  const [showOnline, setShowOnline] = useState(true)
  const [systemPrompt, setSystemPrompt] = useState("")
  const [documentation, setDocumentation] = useState("")

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [tokens, setTokens] = useState<TokenSummary[]>([])
  const [tokenName, setTokenName] = useState("")
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [tokenBusy, setTokenBusy] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)

  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("30")
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null)
  const [conversationMessages, setConversationMessages] = useState<
    ConversationMessage[]
  >([])
  const [conversationLoading, setConversationLoading] = useState(false)
  const [conversationsLoading, setConversationsLoading] = useState(false)
  const [conversationStatus, setConversationStatus] = useState<
    "all" | "open" | "resolved"
  >("all")
  const [conversationDateRange, setConversationDateRange] =
    useState<"7" | "30" | "90">("30")

  useEffect(() => {
    if (typeof window === "undefined") return
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const widget = localStorage.getItem(AUTH_WIDGET_KEY)
    const tenant = localStorage.getItem(AUTH_TENANT_KEY)
    if (!token || !widget) {
      router.push("/")
      return
    }
    setAuthToken(token)
    setWidgetId(widget)
    setTenantId(tenant)
    setIsReady(true)
  }, [router])

  const needsWidget = section === "settings" || section === "tokens"
  const needsTokens = section === "tokens" || section === "overview"
  const needsAnalytics = section === "analytics" || section === "overview"
  const needsConversations = section === "conversations" || section === "overview"

  const currentOrigin = useMemo(() => {
    if (typeof window === "undefined") return ""
    return window.location.origin
  }, [])

  const apiFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      if (!authToken) throw new Error("Missing auth token")
      const res = await fetch(path, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          ...(options.headers || {}),
        },
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as
          | { error?: string }
          | null
        throw new Error(data?.error || "Request failed")
      }
      return res
    },
    [authToken]
  )

  const loadWidget = useCallback(async () => {
    if (!widgetId) return
    try {
      const res = await apiFetch(`/api/v1/dashboard/widgets/${widgetId}`)
      const data = (await res.json()) as Widget
      setWidgetName(data.name || "")
      setAllowedOrigin(data.allowed_origin || "")
      const parsed = parseWidgetConfig(data.config)
      setHeaderBackground(parsed.theme?.headerBackground || "#4f46e5")
      setHeaderText(parsed.theme?.headerText || "#ffffff")
      setButtonBackground(parsed.theme?.buttonBackground || "#4f46e5")
      setButtonText(parsed.theme?.buttonText || "#ffffff")
      setLogoUrl(parsed.branding?.logoUrl || "")
      setShowLogo(parsed.branding?.showLogo ?? true)
      setPosition(parsed.placement?.position || "bottom-right")
      setOffsetX(parsed.placement?.offsetX ?? 24)
      setOffsetY(parsed.placement?.offsetY ?? 24)
      setWelcomeMessage(parsed.greeting?.welcomeMessage || "Welcome! How can we help?")
      setInitialPrompt(parsed.greeting?.initialPrompt || "")
      setOpenOnLoad(parsed.behavior?.openOnLoad ?? false)
      setShowOnline(parsed.behavior?.showOnline ?? true)
      setSystemPrompt(parsed.systemPrompt || "")
      setDocumentation(parsed.documentation || "")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load widget")
    }
  }, [apiFetch, widgetId])

  const loadTokens = useCallback(async () => {
    if (!widgetId) return
    try {
      const res = await apiFetch(`/api/v1/dashboard/widgets/${widgetId}/tokens`)
      const data = (await res.json()) as TokenSummary[]
      setTokens(data)
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Failed to load tokens")
    }
  }, [apiFetch, widgetId])

  const loadAnalytics = useCallback(async (days: "7" | "30" | "90") => {
    if (!widgetId) return
    setAnalyticsLoading(true)
    try {
      const to = new Date()
      const from = new Date()
      from.setDate(to.getDate() - Number(days))
      const res = await apiFetch(
        `/api/v1/dashboard/widgets/${widgetId}/analytics?from=${from.toISOString()}&to=${to.toISOString()}`
      )
      const data = (await res.json()) as Analytics
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setAnalyticsLoading(false)
    }
  }, [apiFetch, widgetId])

  const loadConversations = useCallback(async () => {
    if (!widgetId) return
    setConversationsLoading(true)
    try {
      const res = await apiFetch(
        `/api/v1/dashboard/widgets/${widgetId}/conversations?limit=10`
      )
      const data = (await res.json()) as ConversationSummary[]
      setConversations(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations")
    } finally {
      setConversationsLoading(false)
    }
  }, [apiFetch, widgetId])

  useEffect(() => {
    if (!authToken || !widgetId) return
    if (needsWidget) void loadWidget()
    if (needsTokens) void loadTokens()
    if (needsAnalytics) void loadAnalytics(timeRange)
    if (needsConversations) void loadConversations()
  }, [
    authToken,
    widgetId,
    timeRange,
    needsWidget,
    needsTokens,
    needsAnalytics,
    needsConversations,
    loadWidget,
    loadTokens,
    loadAnalytics,
    loadConversations,
  ])

  const loadConversationMessages = async (conversationId: string) => {
    setConversationLoading(true)
    try {
      const res = await apiFetch(
        `/api/v1/dashboard/conversations/${conversationId}/messages`
      )
      const data = (await res.json()) as ConversationMessage[]
      setConversationMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages")
    } finally {
      setConversationLoading(false)
    }
  }

  const handleSave = async () => {
    if (!widgetId) return
    setIsSaving(true)
    setSaveMessage(null)
    setError(null)

    const normalizedOrigin = normalizeAllowedOrigin(allowedOrigin)
    if (!normalizedOrigin && currentOrigin) {
      setAllowedOrigin(currentOrigin)
    }

    const config: WidgetConfig = {
      title: widgetName || "AI Assistant",
      theme: {
        headerBackground,
        headerText,
        buttonBackground,
        buttonText,
      },
      branding: {
        logoUrl: logoUrl || undefined,
        showLogo,
      },
      placement: {
        position,
        offsetX,
        offsetY,
      },
      greeting: {
        welcomeMessage,
        initialPrompt: initialPrompt || undefined,
      },
      behavior: {
        openOnLoad,
        showOnline,
      },
      systemPrompt: systemPrompt || undefined,
      documentation: documentation || undefined,
    }

    try {
      await apiFetch(`/api/v1/dashboard/widgets/${widgetId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: widgetName,
          allowed_origin: normalizeAllowedOrigin(allowedOrigin) || currentOrigin,
          config: JSON.stringify(config),
        }),
      })
      setSaveMessage("Settings saved.")
      await loadWidget()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save widget")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateToken = async () => {
    if (!widgetId || !tokenName.trim()) return
    setTokenBusy(true)
    setTokenError(null)
    setCreatedToken(null)
    try {
      const res = await apiFetch(`/api/v1/dashboard/widgets/${widgetId}/tokens`, {
        method: "POST",
        body: JSON.stringify({ name: tokenName }),
      })
      const data = (await res.json()) as { token: string }
      setCreatedToken(data.token)
      setTokenName("")
      await loadTokens()
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Failed to create token")
    } finally {
      setTokenBusy(false)
    }
  }

  const handleRotateTokens = async () => {
    if (!widgetId || !tokenName.trim()) return
    setTokenBusy(true)
    setTokenError(null)
    setCreatedToken(null)
    try {
      const res = await apiFetch(
        `/api/v1/dashboard/widgets/${widgetId}/tokens/rotate`,
        {
          method: "POST",
          body: JSON.stringify({ name: tokenName }),
        }
      )
      const data = (await res.json()) as { token: string }
      setCreatedToken(data.token)
      setTokenName("")
      await loadTokens()
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Failed to rotate tokens")
    } finally {
      setTokenBusy(false)
    }
  }

  const handleRevokeToken = async (tokenId: string) => {
    if (!widgetId) return
    setTokenBusy(true)
    setTokenError(null)
    try {
      await apiFetch(`/api/v1/dashboard/widgets/${widgetId}/tokens/${tokenId}`, {
        method: "DELETE",
      })
      await loadTokens()
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Failed to revoke token")
    } finally {
      setTokenBusy(false)
    }
  }

  const handleCopyToken = async () => {
    if (!createdToken) return
    try {
      await navigator.clipboard.writeText(createdToken)
      setTokenCopied(true)
      window.setTimeout(() => setTokenCopied(false), 1500)
    } catch {
      setTokenCopied(false)
    }
  }

  const handleCopyEmbedSnippet = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet)
      setEmbedCopied(true)
      window.setTimeout(() => setEmbedCopied(false), 1500)
    } catch {
      setEmbedCopied(false)
    }
  }

  const handleSaveAllowedOrigin = async () => {
    if (!widgetId) return
    setIsSaving(true)
    setSaveMessage(null)
    setError(null)
    try {
      await apiFetch(`/api/v1/dashboard/widgets/${widgetId}`, {
        method: "PATCH",
        body: JSON.stringify({
          allowed_origin: normalizeAllowedOrigin(allowedOrigin) || currentOrigin,
        }),
      })
      setSaveMessage("Allowed domains saved.")
      await loadWidget()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save domains")
    } finally {
      setIsSaving(false)
    }
  }

  function normalizeAllowedOrigin(value: string) {
    return (
      value
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)[0] ?? ""
    )
  }

  const appendCurrentOrigin = () => {
    if (!currentOrigin) return
    setAllowedOrigin(currentOrigin)
  }

  const embedSnippet = useMemo(
    () =>
      buildEmbedSnippet({
        widgetId,
        widgetName,
        allowedOrigin: normalizeAllowedOrigin(allowedOrigin) || currentOrigin,
        token: createdToken,
      }),
    [allowedOrigin, createdToken, currentOrigin, widgetId, widgetName]
  )

  return {
    widgetId,
    tenantId,
    isReady,
    widgetName,
    setWidgetName,
    allowedOrigin,
    setAllowedOrigin,
    headerBackground,
    setHeaderBackground,
    headerText,
    setHeaderText,
    buttonBackground,
    setButtonBackground,
    buttonText,
    setButtonText,
    logoUrl,
    setLogoUrl,
    showLogo,
    setShowLogo,
    position,
    setPosition,
    offsetX,
    setOffsetX,
    offsetY,
    setOffsetY,
    welcomeMessage,
    setWelcomeMessage,
    initialPrompt,
    setInitialPrompt,
    openOnLoad,
    setOpenOnLoad,
    showOnline,
    setShowOnline,
    isSaving,
    saveMessage,
    error,
    tokens,
    tokenName,
    setTokenName,
    createdToken,
    tokenError,
    tokenBusy,
    tokenCopied,
    embedCopied,
    analytics,
    timeRange,
    setTimeRange,
    analyticsLoading,
    conversations,
    selectedConversation,
    setSelectedConversation,
    conversationMessages,
    conversationLoading,
    conversationsLoading,
    conversationStatus,
    setConversationStatus,
    conversationDateRange,
    setConversationDateRange,
    currentOrigin,
    normalizeAllowedOrigin,
    appendCurrentOrigin,
    embedSnippet,
    handleSave,
    handleCreateToken,
    handleRotateTokens,
    handleRevokeToken,
    handleCopyToken,
    handleCopyEmbedSnippet,
    handleSaveAllowedOrigin,
    loadConversationMessages,
  }
}

function parseWidgetConfig(raw: string | null): WidgetConfig {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as WidgetConfig
  } catch {
    return {}
  }
}
