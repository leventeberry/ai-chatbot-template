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

export default function OverviewPage() {
  return (
    <DashboardShell section="overview">
      {(data) => (
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
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <OverviewCard
              label={`Sessions (${data.timeRange}d)`}
              value={data.analytics?.sessions.total?.toString() ?? "—"}
              detail={
                data.analytics
                  ? `Today: ${data.analytics.sessions.today}`
                  : "No session data yet"
              }
              isLoading={data.analyticsLoading}
              isEmpty={!data.analytics}
            />
            <OverviewCard
              label={`Messages (${data.timeRange}d)`}
              value={data.analytics?.messages.total?.toString() ?? "—"}
              detail={
                data.analytics
                  ? `User ${data.analytics.messages.user} • Assistant ${data.analytics.messages.assistant}`
                  : "No message data yet"
              }
              isLoading={data.analyticsLoading}
              isEmpty={!data.analytics}
            />
            <OverviewCard
              label="Last chat"
              value={
                data.analytics?.last_chat_at
                  ? formatDate(data.analytics.last_chat_at)
                  : "—"
              }
              detail={
                data.analytics?.last_chat_at
                  ? "Latest message timestamp"
                  : "No chats yet"
              }
              isLoading={data.analyticsLoading}
              isEmpty={!data.analytics?.last_chat_at}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
                <CardDescription>
                  Latest conversations for this widget.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.conversationsLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
                {!data.conversationsLoading &&
                  data.conversations.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No activity yet.
                    </p>
                  )}
                {!data.conversationsLoading &&
                  data.conversations
                    .slice(0, 5)
                    .map((conversation, index) => (
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
                        {index < Math.min(data.conversations.length, 5) - 1 && (
                          <Separator />
                        )}
                      </div>
                    ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top sources</CardTitle>
                <CardDescription>
                  Domains driving conversations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.analyticsLoading && (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                )}
                {!data.analyticsLoading &&
                  !data.analytics?.per_domain.length && (
                    <p className="text-sm text-muted-foreground">
                      No domain data yet.
                    </p>
                  )}
                {!data.analyticsLoading &&
                  data.analytics?.per_domain
                    .slice(0, 5)
                    .map((row, index, items) => (
                      <div
                        key={row.origin || "unknown"}
                        className="space-y-2 text-sm"
                      >
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
    </DashboardShell>
  )
}
