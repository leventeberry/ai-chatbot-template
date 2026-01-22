"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  DashboardSectionHeader,
  formatDate,
  OverviewCard,
  PerDomainActivityList,
  TimeRangeSelect,
} from "@/components/dashboard/dashboard-helpers"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsPage() {
  return (
    <DashboardShell section="analytics">
      {(data) => (
        <section className="space-y-6">
          <DashboardSectionHeader
            title="Analytics"
            description="Usage insights for your widget."
            actions={
              <TimeRangeSelect
                value={data.timeRange}
                onChange={(value) => data.setTimeRange(value)}
              />
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard
              label="Messages"
              value={data.analytics?.messages.total.toString() ?? "—"}
              detail={
                data.analytics
                  ? `User ${data.analytics.messages.user} • Assistant ${data.analytics.messages.assistant}`
                  : "No message data yet"
              }
              isLoading={data.analyticsLoading}
              isEmpty={!data.analytics}
            />
            <OverviewCard
              label="Sessions"
              value={data.analytics?.sessions.total.toString() ?? "—"}
              detail={
                data.analytics
                  ? `Today ${data.analytics.sessions.today}`
                  : "No session data yet"
              }
              isLoading={data.analyticsLoading}
              isEmpty={!data.analytics}
            />
            <OverviewCard
              label="Token usage"
              value={data.analytics?.tokens.length.toString() ?? "—"}
              detail={
                data.analytics
                  ? `Last used ${formatDate(data.analytics.tokens[0]?.last_used_at)}`
                  : "No token data yet"
              }
              isLoading={data.analyticsLoading}
              isEmpty={!data.analytics}
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
                {data.analyticsLoading ? (
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
                {data.analyticsLoading ? (
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
              <PerDomainActivityList
                items={data.analytics?.per_domain ?? []}
                isLoading={data.analyticsLoading}
                emptyMessage="No domain activity yet."
              />
            </CardContent>
          </Card>
        </section>
      )}
    </DashboardShell>
  )
}
