"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { ChatWidget } from "@/components/chat-widget"

export default function WidgetEmbedPage() {
  const params = useSearchParams()
  const widgetId = params.get("widget_id")
  const token = params.get("token")
  const origin = params.get("origin")

  useEffect(() => {
    document.documentElement.style.background = "transparent"
    document.body.style.background = "transparent"
    document.body.style.margin = "0"
  }, [])

  return <ChatWidget widgetId={widgetId} token={token} origin={origin} />
}
