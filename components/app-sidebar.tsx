"use client"

import { useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import {
  Activity,
  Gauge,
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

type UserSnapshot = {
  email: string
  firstName: string
  lastName: string
  role: string
  tier: string
}

const emptySnapshot: UserSnapshot = {
  email: data.user.email,
  firstName: "",
  lastName: "",
  role: "",
  tier: "Basic",
}

const subscribeToStorage = (callback: () => void) => {
  if (typeof window === "undefined") {
    return () => undefined
  }
  const handler = () => callback()
  window.addEventListener("storage", handler)
  return () => window.removeEventListener("storage", handler)
}

const getSnapshot = (): UserSnapshot => {
  if (typeof window === "undefined") return emptySnapshot
  return {
    email: localStorage.getItem(AUTH_USER_EMAIL_KEY) ?? data.user.email,
    firstName: localStorage.getItem(AUTH_USER_FIRST_NAME_KEY) ?? "",
    lastName: localStorage.getItem(AUTH_USER_LAST_NAME_KEY) ?? "",
    role: localStorage.getItem(AUTH_USER_ROLE_KEY) ?? "",
    tier: localStorage.getItem(AUTH_USER_TIER_KEY) ?? "Basic",
  }
}

export function AppSidebar() {
  const pathname = usePathname()
  const snapshot = useSyncExternalStore(
    subscribeToStorage,
    getSnapshot,
    () => emptySnapshot
  )
  const fullName = `${snapshot.firstName} ${snapshot.lastName}`.trim()
  const user: UserInfo = {
    name: fullName || data.user.name,
    email: snapshot.email,
    avatar: data.user.avatar,
  }
  const userTier = snapshot.tier || snapshot.role || "Basic"
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
