"use client"

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
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
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
  teams: [
    {
      name: "Acme Inc",
      logo: LayoutGrid,
      plan: "Pro",
    },
    {
      name: "Sandbox",
      logo: ShieldCheck,
      plan: "Trial",
    },
  ],
  projects: [
    {
      name: "Documentation",
      url: "https://docs.example.com",
      icon: LayoutGrid,
    },
    {
      name: "API Reference",
      url: "https://docs.example.com/api",
      icon: ShieldCheck,
    },
  ],
}

export function AppSidebar() {
  const pathname = usePathname()
  const navMain = navItems.map((item) => ({
    ...item,
    isActive:
      pathname === item.url ||
      (item.url === "/dashboard/overview" && pathname === "/dashboard"),
  }))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
