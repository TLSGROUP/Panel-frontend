"use client"

import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  showAlert?: boolean
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Panel</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.isActive}
              tooltip={item.title}
            >
              <a href={item.url}>
                {item.icon && <item.icon />}
                <span className="flex items-center gap-2">
                  {item.title}
                  {item.showAlert && (
                    <>
                      <span className="sr-only">Profile details required</span>
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full border border-background bg-destructive"
                      />
                    </>
                  )}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
