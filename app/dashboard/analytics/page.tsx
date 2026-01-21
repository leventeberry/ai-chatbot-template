"use client"

import { DashboardShell } from "../_components/dashboard-shell"
import {
  formatDate,
  OverviewCard,
  timeRangeLabel,
} from "../../../lib/dashboard-helpers"
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

export default function AnalyticsPage() {
  return (
    <DashboardShell section="analytics">
      {(data) => (
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
                  {timeRangeLabel(data.timeRange)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup
                  value={data.timeRange}
                  onValueChange={(value) =>
                    data.setTimeRange(value as "7" | "30" | "90")
                  }
                >
                  <DropdownMenuRadioItem value="7">Last 7 days</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="30">Last 30 days</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="90">Last 90 days</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
              {data.analyticsLoading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              )}
              {!data.analyticsLoading && !data.analytics?.per_domain.length && (
                <p className="text-sm text-muted-foreground">
                  No domain activity yet.
                </p>
              )}
              {!data.analyticsLoading &&
                data.analytics?.per_domain.map((row, index, items) => (
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
    </DashboardShell>
  )
}
