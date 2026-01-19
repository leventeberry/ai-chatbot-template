"use client"

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
  navMain: [
    {
      title: "Overview",
      url: "#overview",
      icon: Gauge,
      isActive: true,
    },
    {
      title: "Widget Settings",
      url: "#settings",
      icon: Settings,
    },
    {
      title: "Tokens",
      url: "#tokens",
      icon: ShieldCheck,
    },
    {
      title: "Analytics",
      url: "#analytics",
      icon: Activity,
    },
    {
      title: "Conversations",
      url: "#conversations",
      icon: MessageSquareText,
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
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
