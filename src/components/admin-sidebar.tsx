"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  Bot,
  ChevronDown,
  CreditCard,
  Map,
  Network,
  Settings,
  SquareTerminal,
  Wallet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useProfile } from "@/hooks/useProfile"
import { getMediaUrl } from "@/utils/get-media-url"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const adminNav = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: SquareTerminal,
  },
  {
    title: "Partners",
    url: "/admin/partners",
    icon: Bot,
  },
  {
    title: "Partners map",
    url: "/admin/partners-map",
    icon: Map,
  },
  {
    title: "Wallet",
    url: "/admin/wallet",
    icon: Wallet,
  },
  {
    title: "Account",
    url: "/admin/profile",
    icon: BadgeCheck,
  },
  {
    title: "Billing",
    url: "/admin/billing",
    icon: CreditCard,
  },
  {
    title: "Notifications",
    url: "/admin/notifications",
    icon: Bell,
  },
]

const adminSettingsNav = [
  {
    title: "Stripe settings",
    url: "/admin/settings",
  },
  {
    title: "PayPal settings",
    url: "/admin/paypal-settings",
  },
]

const planSettingsNav = [
  {
    title: "Plan settings",
    url: "/admin/plan-settings",
    icon: Settings,
  },
  {
    title: "MLM engine",
    url: "/admin/mlm-engine",
    icon: Network,
  },
]

const managementSettingsNav = [
  {
    title: "Withdraw requests",
    url: "/admin/management",
    icon: Settings,
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user: profile, hasIncompleteProfile } = useProfile()
  const pathname = usePathname()
  const isSettingsRoute =
    pathname.startsWith("/admin/settings") ||
    pathname.startsWith("/admin/paypal-settings")
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  React.useEffect(() => {
    setSettingsOpen(isSettingsRoute)
  }, [isSettingsRoute])

  const sidebarUser = {
    name: profile?.name || profile?.email || "",
    email: profile?.email || "",
    avatar: getMediaUrl(profile?.avatarPath),
  }

  const navItems = React.useMemo(
    () =>
      adminNav.map((item) => ({
        ...item,
        isActive: pathname === item.url,
        showAlert: item.url === "/admin/profile" && hasIncompleteProfile,
      })),
    [pathname, hasIncompleteProfile],
  )

  const adminSettingsItems = React.useMemo(
    () =>
      adminSettingsNav.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    [pathname],
  )

  const managementSettingsItems = React.useMemo(
    () =>
      managementSettingsNav.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    [pathname],
  )

  const planSettingsItems = React.useMemo(
    () =>
      planSettingsNav.map((item) => ({
        ...item,
        isActive: pathname === item.url,
      })),
    [pathname],
  )

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavUser user={sidebarUser} showAttentionIndicator={hasIncompleteProfile} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} label="Panel" />
        <SidebarGroup>
          <SidebarGroupLabel>Admin Settings</SidebarGroupLabel>
          <SidebarMenu>
            <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton size="sm">
                    <CreditCard />
                    <span>Payment settings</span>
                    <ChevronDown className="ml-auto transition-transform data-[state=open]:rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
              </SidebarMenuItem>
              <CollapsibleContent>
                <SidebarMenu className="ml-6 mt-1">
                  {adminSettingsItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={item.isActive} size="sm">
                        <Link href={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
            {planSettingsItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <NavMain items={managementSettingsItems} label="Management Settings" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
