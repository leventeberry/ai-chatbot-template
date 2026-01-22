"use client"

import type { ReactNode } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString()
}

export function timeRangeLabel(value: "7" | "30" | "90") {
  if (value === "7") return "Last 7 days"
  if (value === "90") return "Last 90 days"
  return "Last 30 days"
}

export function buildEmbedSnippet({
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
  const safeDomain =
    typeof window !== "undefined" ? window.location.origin : "https://YOUR_DOMAIN"
  return `<script
  src="${safeDomain}/widget.js"
  data-widget-id="${safeWidgetId}"
  data-token="${safeToken}"
  data-origin="${safeOrigin}"
  async
></script>

<!-- Widget: ${safeName} -->`
}

export function DashboardSectionHeader({
  title,
  description,
  actions,
}: {
  title: string
  description: string
  actions?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  )
}

export function TimeRangeSelect({
  value,
  onChange,
  align = "end",
}: {
  value: "7" | "30" | "90"
  onChange: (value: "7" | "30" | "90") => void
  align?: "start" | "end" | "center"
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {timeRangeLabel(value)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) =>
            onChange(nextValue as "7" | "30" | "90")
          }
        >
          <DropdownMenuRadioItem value="7">Last 7 days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="30">Last 30 days</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="90">Last 90 days</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function OverviewCard({
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

export function LoadingLines({
  lines = ["w-2/3", "w-1/2", "w-3/4"],
}: {
  lines?: string[]
}) {
  return (
    <div className="space-y-2">
      {lines.map((width, index) => (
        <Skeleton key={`${width}-${index}`} className={`h-4 ${width}`} />
      ))}
    </div>
  )
}

type DomainActivity = {
  origin: string
  sessions: number
  messages: number
}

export function PerDomainActivityList({
  items,
  isLoading,
  emptyMessage,
}: {
  items: DomainActivity[]
  isLoading?: boolean
  emptyMessage: string
}) {
  if (isLoading) {
    return <LoadingLines />
  }

  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <>
      {items.map((row, index) => (
        <div key={row.origin || "unknown"} className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">{row.origin || "Unknown origin"}</span>
            <span className="text-xs text-muted-foreground">
              {row.sessions} sessions • {row.messages} messages
            </span>
          </div>
          {index < items.length - 1 && <Separator />}
        </div>
      ))}
    </>
  )
}

export function ColorField({
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
