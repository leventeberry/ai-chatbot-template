"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  DashboardSectionHeader,
  formatDate,
  LoadingLines,
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
import { Separator } from "@/components/ui/separator"

export default function OverviewPage() {
  return (
    <DashboardShell section="overview">
      {(data) => (
        <section className="space-y-6">
          <DashboardSectionHeader
            title="Overview"
            description="Snapshot of recent widget activity."
            actions={
              <TimeRangeSelect
                value={data.timeRange}
                onChange={(value) => data.setTimeRange(value)}
              />
            }
          />
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
                {data.conversationsLoading && <LoadingLines />}
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
                <PerDomainActivityList
                  items={(data.analytics?.per_domain ?? []).slice(0, 5)}
                  isLoading={data.analyticsLoading}
                  emptyMessage="No domain data yet."
                />
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </DashboardShell>
  )
}
