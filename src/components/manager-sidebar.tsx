"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { BadgeCheck, Bell, Bot, CreditCard, Map, SquareTerminal, Wallet } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useProfile } from "@/hooks/useProfile"
import { getMediaUrl } from "@/utils/get-media-url"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const managerNav = [
  {
    title: "Dashboard",
    url: "/manager",
    icon: SquareTerminal,
  },
  {
    title: "Partners",
    url: "/manager/referrals",
    icon: Bot,
  },
  {
    title: "Partners map",
    url: "/manager/partners-map",
    icon: Map,
  },
  {
    title: "Wallet",
    url: "/manager/wallet",
    icon: Wallet,
  },
  {
    title: "Account",
    url: "/manager/profile",
    icon: BadgeCheck,
  },
  {
    title: "Billing",
    url: "/manager/billing",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    url: "/manager/notifications",
    icon: Bell,
  },
]

export function ManagerSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: profile, hasIncompleteProfile } = useProfile()
  const pathname = usePathname()

  const sidebarUser = {
    name: profile?.name || profile?.email || "",
    email: profile?.email || "",
    avatar: getMediaUrl(profile?.avatarPath),
  }

  const navItems = React.useMemo(
    () =>
      managerNav.map((item) => ({
        ...item,
        isActive: pathname === item.url,
        showAlert: item.url === "/manager/profile" && hasIncompleteProfile,
      })),
    [pathname, hasIncompleteProfile],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={sidebarUser} showAttentionIndicator={hasIncompleteProfile} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
