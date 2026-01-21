"use client"

import type { ReactNode } from "react"
import { useDashboardData, type DashboardSection } from "../../../hooks/use-dashboard-data"

export type DashboardData = ReturnType<typeof useDashboardData>

export function DashboardShell({
  section,
  children,
}: {
  section: DashboardSection
  children: (data: DashboardData) => ReactNode
}) {
  const data = useDashboardData(section)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-display font-bold text-foreground">
          Client Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your widget settings, tokens, and usage analytics.
        </p>
        {data.tenantId && (
          <p className="text-xs text-muted-foreground">
            Tenant: {data.tenantId} • Widget: {data.widgetId}
          </p>
        )}
      </header>

      {data.error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {data.error}
        </div>
      )}

      {data.isReady ? (
        children(data)
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
          Loading dashboard...
        </div>
      )}
    </div>
  )
}
