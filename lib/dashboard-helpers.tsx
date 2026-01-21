"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
        {isLoading ? <Skeleton className="h-8 w-24" /> : <CardTitle className="text-2xl">{value}</CardTitle>}
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
