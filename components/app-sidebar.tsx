"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
  Activity,
  Gauge,
  LayoutGrid,
  MessageSquareText,
  Settings,
  ShieldCheck,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Overview",
    url: "/dashboard/overview",
    icon: Gauge,
  },
  {
    title: "Widget Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Tokens",
    url: "/dashboard/tokens",
    icon: ShieldCheck,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: Activity,
  },
  {
    title: "Conversations",
    url: "/dashboard/conversations",
    icon: MessageSquareText,
  },
]

const data = {
  user: {
    name: "Client Admin",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  projects: [
    {
      name: "Support",
      url: "/dashboard/support",
      icon: ShieldCheck,
    },
  ],
}

type UserInfo = {
  name: string
  email: string
  avatar: string
}

const AUTH_USER_EMAIL_KEY = "auth_user_email"
const AUTH_USER_FIRST_NAME_KEY = "auth_user_first_name"
const AUTH_USER_LAST_NAME_KEY = "auth_user_last_name"
const AUTH_USER_ROLE_KEY = "auth_user_role"
const AUTH_USER_TIER_KEY = "auth_user_tier"

export function AppSidebar() {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [user, setUser] = useState<UserInfo>(data.user)
  const [userTier, setUserTier] = useState("Basic")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return
    const email = localStorage.getItem(AUTH_USER_EMAIL_KEY) ?? data.user.email
    const firstName = localStorage.getItem(AUTH_USER_FIRST_NAME_KEY) ?? ""
    const lastName = localStorage.getItem(AUTH_USER_LAST_NAME_KEY) ?? ""
    const role = localStorage.getItem(AUTH_USER_ROLE_KEY) ?? ""
    const tier = localStorage.getItem(AUTH_USER_TIER_KEY) ?? "Basic"
    const fullName = `${firstName} ${lastName}`.trim()
    const displayName = fullName || data.user.name

    setUser({
      name: displayName,
      email,
      avatar: data.user.avatar,
    })
    setUserTier(tier || role || "Basic")
  }, [isMounted])

  if (!isMounted) {
    return null
  }
  const navMain = navItems.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url === "/dashboard/overview" && pathname === "/dashboard"),
  }))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-sm font-bold text-primary-foreground">
                  AI
                </div>
                <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="text-sm font-semibold">ChatTemplate</span>
                  <span className="text-xs text-muted-foreground">{userTier}</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
