"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

type DashboardSection =
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

type TokenSummary = {
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

export function DashboardContent({ section }: { section: DashboardSection }) {
  const router = useRouter()
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [widgetId, setWidgetId] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)

  const [widget, setWidget] = useState<Widget | null>(null)
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
  const [tokenToRevoke, setTokenToRevoke] = useState<TokenSummary | null>(null)

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
  ])

  const currentOrigin = useMemo(() => {
    if (typeof window === "undefined") return ""
    return window.location.origin
  }, [])

  const apiFetch = async (path: string, options: RequestInit = {}) => {
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
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      throw new Error(data?.error || "Request failed")
    }
    return res
  }

  const loadWidget = async () => {
    if (!widgetId) return
    try {
      const res = await apiFetch(`/api/v1/dashboard/widgets/${widgetId}`)
      const data = (await res.json()) as Widget
      setWidget(data)
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
  }

  const loadTokens = async () => {
    if (!widgetId) return
    try {
      const res = await apiFetch(`/api/v1/dashboard/widgets/${widgetId}/tokens`)
      const data = (await res.json()) as TokenSummary[]
      setTokens(data)
    } catch (err) {
      setTokenError(err instanceof Error ? err.message : "Failed to load tokens")
    }
  }

  const loadAnalytics = async (days: "7" | "30" | "90") => {
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
  }

  const loadConversations = async () => {
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
  }

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
      })
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

  const normalizeAllowedOrigin = (value: string) =>
    value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)[0] ?? ""

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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Client Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your widget settings, tokens, and usage analytics.
        </p>
        {tenantId && (
          <p className="text-xs text-muted-foreground">
            Tenant: {tenantId} • Widget: {widgetId}
          </p>
        )}
      </header>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isReady ? (
        <>
          {section === "overview" && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Overview</h2>
                  <p className="text-sm text-muted-foreground">
                    Snapshot of recent widget activity.
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {timeRangeLabel(timeRange)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={timeRange}
                      onValueChange={(value) => setTimeRange(value as "7" | "30" | "90")}
                    >
                      <DropdownMenuRadioItem value="7">Last 7 days</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="30">
                        Last 30 days
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="90">
                        Last 90 days
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <OverviewCard
                  label={`Sessions (${timeRange}d)`}
                  value={analytics?.sessions.total?.toString() ?? "—"}
                  detail={
                    analytics
                      ? `Today: ${analytics.sessions.today}`
                      : "No session data yet"
                  }
                  isLoading={analyticsLoading}
                  isEmpty={!analytics}
                />
                <OverviewCard
                  label={`Messages (${timeRange}d)`}
                  value={analytics?.messages.total?.toString() ?? "—"}
                  detail={
                    analytics
                      ? `User ${analytics.messages.user} • Assistant ${analytics.messages.assistant}`
                      : "No message data yet"
                  }
                  isLoading={analyticsLoading}
                  isEmpty={!analytics}
                />
                <OverviewCard
                  label="Last chat"
                  value={analytics?.last_chat_at ? formatDate(analytics.last_chat_at) : "—"}
                  detail={
                    analytics?.last_chat_at
                      ? "Latest message timestamp"
                      : "No chats yet"
                  }
                  isLoading={analyticsLoading}
                  isEmpty={!analytics?.last_chat_at}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent activity</CardTitle>
                    <CardDescription>Latest conversations for this widget.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversationsLoading && (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    )}
                    {!conversationsLoading && conversations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No activity yet.</p>
                    )}
                    {!conversationsLoading &&
                      conversations.slice(0, 5).map((conversation, index) => (
                        <div key={conversation.id} className="space-y-2">
                          <div className="space-y-1 text-sm">
                            <p className="font-medium">
                              Session {conversation.session_id}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {conversation.origin || "Unknown origin"} •{" "}
                              {conversation.message_count} messages •{" "}
                              {formatDate(conversation.created_at)}
                            </p>
                          </div>
                          {index < Math.min(conversations.length, 5) - 1 && (
                            <Separator />
                          )}
                        </div>
                      ))}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top sources</CardTitle>
                    <CardDescription>Domains driving conversations.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {analyticsLoading && (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    )}
                    {!analyticsLoading && !analytics?.per_domain.length && (
                      <p className="text-sm text-muted-foreground">
                        No domain data yet.
                      </p>
                    )}
                    {!analyticsLoading &&
                      analytics?.per_domain
                        .slice(0, 5)
                        .map((row, index, items) => (
                          <div key={row.origin || "unknown"} className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {row.origin || "Unknown origin"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {row.sessions} sessions • {row.messages} messages
                              </span>
                            </div>
                            {index < items.length - 1 && <Separator />}
                          </div>
                        ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {section === "settings" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Widget Settings</h2>
                <p className="text-sm text-muted-foreground">
                  Configure widget behavior and appearance.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Behavior</CardTitle>
                    <CardDescription>Greeting and assistant behavior.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Widget name</label>
                      <Input
                        value={widgetName}
                        onChange={(event) => setWidgetName(event.target.value)}
                        placeholder="Your widget name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Greeting message</label>
                      <Input
                        value={welcomeMessage}
                        onChange={(event) => setWelcomeMessage(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Initial prompt (optional)</label>
                      <Input
                        value={initialPrompt}
                        onChange={(event) => setInitialPrompt(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={openOnLoad}
                          onCheckedChange={(value) => setOpenOnLoad(Boolean(value))}
                        />
                        <span className="text-sm">Open on load</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={showOnline}
                          onCheckedChange={(value) => setShowOnline(Boolean(value))}
                        />
                        <span className="text-sm">Show online indicator</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Theme</CardTitle>
                    <CardDescription>Update widget colors and branding.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <ColorField label="Header" value={headerBackground} onChange={setHeaderBackground} />
                      <ColorField label="Header Text" value={headerText} onChange={setHeaderText} />
                      <ColorField label="Button" value={buttonBackground} onChange={setButtonBackground} />
                      <ColorField label="Button Text" value={buttonText} onChange={setButtonText} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Logo URL</label>
                      <Input
                        value={logoUrl}
                        onChange={(event) => setLogoUrl(event.target.value)}
                        placeholder="https://example.com/logo.png"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={showLogo}
                          onCheckedChange={(value) => setShowLogo(Boolean(value))}
                        />
                        <span className="text-sm">Show logo in header</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Placement</CardTitle>
                    <CardDescription>Position the widget on the page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <select
                        value={position}
                        onChange={(event) =>
                          setPosition(event.target.value as "bottom-right" | "bottom-left")
                        }
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      >
                        <option value="bottom-right">Bottom right</option>
                        <option value="bottom-left">Bottom left</option>
                      </select>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={offsetX}
                          onChange={(event) => setOffsetX(Number(event.target.value))}
                          placeholder="Offset X"
                        />
                        <Input
                          type="number"
                          value={offsetY}
                          onChange={(event) => setOffsetY(Number(event.target.value))}
                          placeholder="Offset Y"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Allowed domains</CardTitle>
                    <CardDescription>
                      Set the exact domain where the widget can be embedded.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={allowedOrigin}
                      onChange={(event) =>
                        setAllowedOrigin(normalizeAllowedOrigin(event.target.value))
                      }
                      placeholder="https://example.com"
                    />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Current origin: {currentOrigin || "unknown"}</span>
                      <Button size="sm" variant="ghost" onClick={appendCurrentOrigin}>
                        Use current domain
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Embed snippet</CardTitle>
                  <CardDescription>Use this HTML snippet on any site.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>Copy and paste this into your app.</span>
                    <Button size="sm" variant="outline" onClick={handleCopyEmbedSnippet}>
                      {embedCopied ? "Copied" : "Copy snippet"}
                    </Button>
                  </div>
                  <pre className="rounded-lg border border-border bg-muted px-3 py-2 text-xs overflow-x-auto">
{embedSnippet}
                  </pre>
                  <p className="text-xs text-muted-foreground">
                    Load the script from the domain hosting your widget.
                  </p>
                </CardContent>
              </Card>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save settings"}
                </Button>
                {saveMessage && <span className="text-sm text-emerald-600">{saveMessage}</span>}
                <span className="text-xs text-muted-foreground">
                  Saving the allowed origin enforces widget CORS checks.
                </span>
              </div>
            </section>
          )}

          {section === "tokens" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">Embed & Tokens</h2>
                <p className="text-sm text-muted-foreground">
                  Securely manage widget tokens and embed instructions.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Embed snippet</CardTitle>
                    <CardDescription>Drop this script tag into any HTML page.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>Copy and paste this into your app.</span>
                      <Button size="sm" variant="outline" onClick={handleCopyEmbedSnippet}>
                        {embedCopied ? "Copied" : "Copy snippet"}
                      </Button>
                    </div>
                    <pre className="rounded-lg border border-border bg-muted px-3 py-2 text-xs overflow-x-auto">
{embedSnippet}
                    </pre>
                    <p className="text-xs text-muted-foreground">
                      Set <code>data-origin</code> to the domain where you embed the widget.
                    </p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Safety tips:</p>
                      <p>• Tokens are secrets. Do not expose them in public repos.</p>
                      <p>• Rotate tokens immediately if leaked.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Create / Rotate token</CardTitle>
                    <CardDescription>Generate new widget access tokens.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Input
                        value={tokenName}
                        onChange={(event) => setTokenName(event.target.value)}
                        placeholder="Token name"
                      />
                      <div className="flex gap-2">
                        <Button onClick={handleCreateToken} disabled={tokenBusy}>
                          Create
                        </Button>
                        <Button variant="outline" onClick={handleRotateTokens} disabled={tokenBusy}>
                          Rotate
                        </Button>
                      </div>
                    </div>
                    {tokenError && (
                      <p className="text-xs text-destructive">{tokenError}</p>
                    )}
                    {createdToken && (
                      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 space-y-2">
                        <div>
                          New token (copy now): <strong>{createdToken}</strong>
                        </div>
                        <Button size="sm" variant="outline" onClick={handleCopyToken}>
                          {tokenCopied ? "Copied" : "Copy token"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Allowed domains</CardTitle>
                    <CardDescription>
                      Restrict where the widget can be embedded.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Input
                      value={allowedOrigin}
                      onChange={(event) =>
                        setAllowedOrigin(normalizeAllowedOrigin(event.target.value))
                      }
                      placeholder="https://example.com"
                    />
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Current origin: {currentOrigin || "unknown"}</span>
                      <Button size="sm" variant="ghost" onClick={appendCurrentOrigin}>
                        Use current domain
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={handleSaveAllowedOrigin} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save domains"}
                      </Button>
                      {saveMessage && (
                        <span className="text-xs text-emerald-600">{saveMessage}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Active tokens</CardTitle>
                    <CardDescription>Manage tokens and revoke access.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tokens.length === 0 && (
                      <p className="text-sm text-muted-foreground">No tokens yet.</p>
                    )}
                    {tokens.map((token, index) => (
                      <div key={token.id} className="space-y-2 text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium">{token.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Created {formatDate(token.created_at)} • Last used{" "}
                              {formatDate(token.last_used_at)}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setTokenToRevoke(token)}
                          >
                            Revoke
                          </Button>
                        </div>
                        {index < tokens.length - 1 && <Separator />}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Dialog open={Boolean(tokenToRevoke)} onOpenChange={() => setTokenToRevoke(null)}>
                <DialogContent className="max-w-md bg-background">
                  <DialogHeader>
                    <DialogTitle>Revoke token</DialogTitle>
                    <DialogDescription>
                      This token will be disabled immediately. You can create a new token
                      at any time.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex justify-end gap-2 px-6 pb-6">
                    <Button variant="ghost" onClick={() => setTokenToRevoke(null)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        if (tokenToRevoke) {
                          void handleRevokeToken(tokenToRevoke.id)
                          setTokenToRevoke(null)
                        }
                      }}
                    >
                      Revoke token
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </section>
          )}

          {section === "analytics" && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Analytics</h2>
                  <p className="text-sm text-muted-foreground">
                    Usage insights for your widget.
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {timeRangeLabel(timeRange)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuRadioGroup
                      value={timeRange}
                      onValueChange={(value) => setTimeRange(value as "7" | "30" | "90")}
                    >
                      <DropdownMenuRadioItem value="7">Last 7 days</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="30">
                        Last 30 days
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="90">
                        Last 90 days
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <OverviewCard
                  label="Messages"
                  value={analytics?.messages.total.toString() ?? "—"}
                  detail={
                    analytics
                      ? `User ${analytics.messages.user} • Assistant ${analytics.messages.assistant}`
                      : "No message data yet"
                  }
                  isLoading={analyticsLoading}
                  isEmpty={!analytics}
                />
                <OverviewCard
                  label="Sessions"
                  value={analytics?.sessions.total.toString() ?? "—"}
                  detail={
                    analytics ? `Today ${analytics.sessions.today}` : "No session data yet"
                  }
                  isLoading={analyticsLoading}
                  isEmpty={!analytics}
                />
                <OverviewCard
                  label="Token usage"
                  value={analytics?.tokens.length.toString() ?? "—"}
                  detail={
                    analytics
                      ? `Last used ${formatDate(analytics.tokens[0]?.last_used_at)}`
                      : "No token data yet"
                  }
                  isLoading={analyticsLoading}
                  isEmpty={!analytics}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sessions over time</CardTitle>
                    <CardDescription>
                      Trend of sessions in the selected range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                        No time-series data available yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Messages over time</CardTitle>
                    <CardDescription>
                      Trend of messages in the selected range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-32 w-full" />
                      </div>
                    ) : (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                        No time-series data available yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Per-domain activity</CardTitle>
                  <CardDescription>Sessions and messages by domain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analyticsLoading && (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  )}
                  {!analyticsLoading && !analytics?.per_domain.length && (
                    <p className="text-sm text-muted-foreground">
                      No domain activity yet.
                    </p>
                  )}
                  {!analyticsLoading &&
                    analytics?.per_domain.map((row, index, items) => (
                      <div key={row.origin || "unknown"} className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            {row.origin || "Unknown origin"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {row.sessions} sessions • {row.messages} messages
                          </span>
                        </div>
                        {index < items.length - 1 && <Separator />}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </section>
          )}

          {section === "conversations" && (
            <section className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Conversations</h2>
                  <p className="text-sm text-muted-foreground">
                    Review recent chat sessions for this widget.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {timeRangeLabel(conversationDateRange)}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuRadioGroup
                        value={conversationDateRange}
                        onValueChange={(value) =>
                          setConversationDateRange(value as "7" | "30" | "90")
                        }
                      >
                        <DropdownMenuRadioItem value="7">
                          Last 7 days
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="30">
                          Last 30 days
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="90">
                          Last 90 days
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1">
                    {(["all", "open", "resolved"] as const).map((status) => (
                      <Button
                        key={status}
                        variant={conversationStatus === status ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setConversationStatus(status)}
                      >
                        {status === "all"
                          ? "All"
                          : status === "open"
                            ? "Open"
                            : "Resolved"}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversation list</CardTitle>
                    <CardDescription>
                      Showing latest sessions for the selected range.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversationsLoading && (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    )}
                    {!conversationsLoading && conversations.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No conversations yet.
                      </p>
                    )}
                    {!conversationsLoading &&
                      conversations.map((conversation, index) => (
                        <div key={conversation.id} className="space-y-2">
                          <button
                            onClick={() => {
                              setSelectedConversation(conversation)
                              void loadConversationMessages(conversation.id)
                            }}
                            className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                              selectedConversation?.id === conversation.id
                                ? "border-primary/60 bg-primary/10"
                                : "border-border hover:bg-muted"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                Session {conversation.session_id}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {conversation.message_count} messages
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {conversation.origin || "Unknown origin"} •{" "}
                              {formatDate(conversation.created_at)}
                            </div>
                          </button>
                          {index < conversations.length - 1 && <Separator />}
                        </div>
                      ))}
                  </CardContent>
                </Card>

                <Card className="min-h-[320px]">
                  <CardHeader>
                    <CardTitle className="text-base">Transcript</CardTitle>
                    <CardDescription>
                      Messages for the selected conversation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {conversationLoading && (
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    )}
                    {!conversationLoading && conversationMessages.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Select a session to view messages.
                      </p>
                    )}
                    <div className="space-y-3 text-sm">
                      {conversationMessages.map((message) => (
                        <div key={message.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="uppercase tracking-wide">{message.role}</span>
                            <span>{formatDate(message.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}
        </>
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Loading dashboard...
        </div>
      )}
    </div>
  )
}

function parseWidgetConfig(raw: string | null): WidgetConfig {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as WidgetConfig
  } catch {
    return {}
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

function timeRangeLabel(value: "7" | "30" | "90") {
  if (value === "7") return "Last 7 days"
  if (value === "90") return "Last 90 days"
  return "Last 30 days"
}

function buildEmbedSnippet({
  widgetId,
  widgetName,
  allowedOrigin,
  token,
}: {
  widgetId: string | null
  widgetName: string
  allowedOrigin: string
  token: string | null
}) {
  const safeName = widgetName.trim() || "AI Assistant"
  const safeOrigin = allowedOrigin || "https://example.com"
  const safeToken = token?.trim() || "<YOUR_WIDGET_TOKEN>"
  const safeWidgetId = widgetId || "<YOUR_WIDGET_ID>"
  const safeDomain = typeof window !== "undefined"
    ? window.location.origin
    : "https://YOUR_DOMAIN"
  return `<script
  src="${safeDomain}/widget.js"
  data-widget-id="${safeWidgetId}"
  data-token="${safeToken}"
  data-origin="${safeOrigin}"
  async
></script>

<!-- Widget: ${safeName} -->`
}

function OverviewCard({
  label,
  value,
  detail,
  isLoading,
  isEmpty,
}: {
  label: string
  value: string
  detail: string
  isLoading?: boolean
  isEmpty?: boolean
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">
          {label}
        </CardDescription>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <CardTitle className="text-2xl">{value}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <p className="text-xs text-muted-foreground">
            {isEmpty ? "No data yet" : detail}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 w-8 rounded border border-border bg-background"
      />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="flex-1 rounded-lg border border-border bg-background px-2 py-1 text-xs"
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </label>
  )
}
