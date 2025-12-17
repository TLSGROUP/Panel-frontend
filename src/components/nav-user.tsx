"use client"

import {
  BadgeCheck,
  Bell,
  Camera,
  ChevronsUpDown,
  CreditCard,
  LogOut,
} from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { PUBLIC_PAGES } from "@/config/pages/public.config"
import authService from "@/services/auth/auth.service"
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

export function NavUser({
  user,
  showAttentionIndicator = false,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
  showAttentionIndicator?: boolean
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const displayName = user.name?.trim() || user.email
  const displayEmail = user.email
  const initials = (displayName || "??").slice(0, 2).toUpperCase()
  const avatarSrc = user.avatar?.trim() ? user.avatar : undefined

  const { mutate: handleLogout, isPending: isLogoutPending } = useMutation({
    mutationKey: ["logout"],
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      router.push(PUBLIC_PAGES.LOGIN)
    },
  })

  const AttentionBadge = () =>
    showAttentionIndicator ? (
      <>
        <span className="sr-only">Profile details required</span>
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-background bg-destructive"
        />
      </>
    ) : null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                  <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm">
                    {avatarSrc ? (
                      initials
                    ) : (
                      <>
                        <Camera className="size-4" aria-hidden />
                        <span className="sr-only">Add a profile photo</span>
                      </>
                    )}
                  </AvatarFallback>
                </Avatar>
                <AttentionBadge />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{displayEmail}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg overflow-visible border border-white/10 bg-black/40 backdrop-blur-md"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            avoidCollisions={true}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div className="relative">
                  <Avatar className="h-8 w-8 rounded-lg">
                    {avatarSrc && <AvatarImage src={avatarSrc} alt={displayName} />}
                    <AvatarFallback className="rounded-lg bg-primary text-primary-foreground text-sm">
                      {avatarSrc ? (
                        initials
                      ) : (
                        <>
                          <Camera className="size-4" aria-hidden />
                          <span className="sr-only">Add a profile photo</span>
                        </>
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <AttentionBadge />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{displayEmail}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/profile")}
              >
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/billing")}
              >
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => router.push("/dashboard/notifications")}
              >
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              disabled={isLogoutPending}
              onClick={() => handleLogout()}
            >
              <LogOut />
              {isLogoutPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
