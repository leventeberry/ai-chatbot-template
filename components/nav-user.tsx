"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type UserInfo = {
  name: string
  email: string
  avatar: string
}

const AUTH_TOKEN_KEY = "auth_token"
const AUTH_TENANT_KEY = "auth_tenant_id"
const AUTH_WIDGET_KEY = "auth_widget_id"
const AUTH_USER_EMAIL_KEY = "auth_user_email"
const AUTH_USER_FIRST_NAME_KEY = "auth_user_first_name"
const AUTH_USER_LAST_NAME_KEY = "auth_user_last_name"
const AUTH_USER_ROLE_KEY = "auth_user_role"
const AUTH_USER_TIER_KEY = "auth_user_tier"

const getInitials = (name: string, fallbackEmail: string) => {
  const cleaned = name.replace(/\s*\([^)]*\)\s*$/, "").trim()
  const source = cleaned || fallbackEmail.split("@")[0] || "User"
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  const first = parts[0]?.[0] ?? ""
  const last = parts[parts.length - 1]?.[0] ?? ""
  return `${first}${last}`.toUpperCase()
}

export function NavUser({ user }: { user: UserInfo }) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const initials = getInitials(user.name, user.email)

  const handleLogout = () => {
    if (typeof window === "undefined") return
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_TENANT_KEY)
    localStorage.removeItem(AUTH_WIDGET_KEY)
    localStorage.removeItem(AUTH_USER_EMAIL_KEY)
    localStorage.removeItem(AUTH_USER_FIRST_NAME_KEY)
    localStorage.removeItem(AUTH_USER_LAST_NAME_KEY)
    localStorage.removeItem(AUTH_USER_ROLE_KEY)
    localStorage.removeItem(AUTH_USER_TIER_KEY)
    router.push("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account">
                  <BadgeCheck />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">
                  <CreditCard />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/notifications">
                  <Bell />
                  Notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
