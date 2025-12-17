'use client'

import { useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { LanguagePicker } from "@/components/language/LanguagePicker"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type NotificationSetting = {
  id: string
  label: string
  description: string
}

const notificationSettings: NotificationSetting[] = [
  {
    id: "email_updates",
    label: "Email updates",
    description: "Major account and product changes.",
  },
  {
    id: "referral_alerts",
    label: "Referral alerts",
    description: "Get a note when someone joins with your code.",
  },
  {
    id: "payouts",
    label: "Payout confirmations",
    description: "Receive confirmation of completed payouts.",
  },
  {
    id: "weekly_digest",
    label: "Weekly digest",
    description: "Activity summary delivered every Monday.",
  },
]

export default function NotificationsPage() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    email_updates: true,
    referral_alerts: true,
    payouts: false,
    weekly_digest: true,
  })

  const toggleSetting = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Notifications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto">
            <LanguagePicker inline />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Card>
            <CardHeader>
              <CardTitle>Notification channels</CardTitle>
              <CardDescription>
                Choose where we should deliver automation, referral, and payout updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 @lg:grid-cols-2">
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm text-muted-foreground">Email address</p>
                <Input
                  type="email"
                  defaultValue="team@hashhedge.com"
                  className="mt-2 bg-transparent"
                />
              </div>
              <div className="rounded-lg border border-white/10 p-4">
                <p className="text-sm text-muted-foreground">Telegram username</p>
                <Input
                  type="text"
                  placeholder="@hashhedge_team"
                  className="mt-2 bg-transparent"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>Toggle updates on or off at any time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 p-4"
                >
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {setting.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={settings[setting.id]}
                    onClick={() => toggleSetting(setting.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full border border-white/20 transition-colors ${
                      settings[setting.id] ? "bg-emerald-500" : "bg-black/40"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition ${
                        settings[setting.id] ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline">Reset to defaults</Button>
            </CardFooter>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
