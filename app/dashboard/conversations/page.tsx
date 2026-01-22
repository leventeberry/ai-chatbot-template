"use client"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  DashboardSectionHeader,
  formatDate,
  LoadingLines,
  TimeRangeSelect,
} from "@/components/dashboard/dashboard-helpers"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export default function ConversationsPage() {
  return (
    <DashboardShell section="conversations">
      {(data) => (
        <section className="space-y-6">
          <DashboardSectionHeader
            title="Conversations"
            description="Review recent chat sessions for this widget."
            actions={
              <>
                <TimeRangeSelect
                  value={data.conversationDateRange}
                  onChange={(value) => data.setConversationDateRange(value)}
                />
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background p-1">
                  {(["all", "open", "resolved"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={
                        data.conversationStatus === status ? "default" : "ghost"
                      }
                      size="sm"
                      onClick={() => data.setConversationStatus(status)}
                    >
                      {status === "all"
                        ? "All"
                        : status === "open"
                        ? "Open"
                        : "Resolved"}
                    </Button>
                  ))}
                </div>
              </>
            }
          />
          <div className="grid gap-6 md:grid-cols-[1fr_1.5fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Conversation list</CardTitle>
                <CardDescription>
                  Showing latest sessions for the selected range.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.conversationsLoading && <LoadingLines />}
                {!data.conversationsLoading && data.conversations.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No conversations yet.
                  </p>
                )}
                {!data.conversationsLoading &&
                  data.conversations.map((conversation, index) => (
                    <div key={conversation.id} className="space-y-2">
                      <button
                        onClick={() => {
                          data.setSelectedConversation(conversation)
                          void data.loadConversationMessages(conversation.id)
                        }}
                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                          data.selectedConversation?.id === conversation.id
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
                      {index < data.conversations.length - 1 && <Separator />}
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
                {data.conversationLoading && (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                )}
                {!data.conversationLoading && data.conversationMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Select a session to view messages.
                  </p>
                )}
                <div className="space-y-3 text-sm">
                  {data.conversationMessages.map((message) => (
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
    </DashboardShell>
  )
}
