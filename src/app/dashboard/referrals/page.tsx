'use client'

import { useEffect, useState } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { LanguagePicker } from "@/components/language/LanguagePicker"
import { SectionCards } from "@/components/ui/section-cards"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

const referralLeaders = [
  { name: "Evelyn Diaz", joined: "Jan 04, 2024", earnings: "$4,900" },
  { name: "Hiro Sato", joined: "Feb 11, 2024", earnings: "$3,650" },
  { name: "Lina Ortega", joined: "Mar 28, 2024", earnings: "$2,780" },
  { name: "Marcus Lee", joined: "May 09, 2024", earnings: "$2,310" },
]

export default function ReferralsPage() {
  const [ready, setReady] = useState(false)
  const skeletonCards = Array.from({ length: 4 })

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(timer)
  }, [])

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
                  <BreadcrumbPage>Referrals</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto">
            <LanguagePicker inline />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {ready ? (
            <SectionCards />
          ) : (
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 lg:px-6">
              {skeletonCards.map((_, index) => (
                <Card key={`ref-skeleton-${index}`} className="@container/card">
                  <CardHeader>
                    <CardDescription>
                      <Skeleton className="h-4 w-32 rounded-full" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                    <Skeleton className="h-4 w-2/3 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle>Referral leaderboard</CardTitle>
              <CardDescription>
                Track who drives the most conversions this quarter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ready
                ? referralLeaders.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex flex-col gap-2 rounded-lg border border-border/60 p-4 @xl:flex-row @xl:items-center @xl:justify-between"
                    >
                      <div>
                        <p className="text-base font-semibold">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Joined {entry.joined}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          Total earnings
                        </p>
                        <p className="text-2xl font-semibold tabular-nums">
                          {entry.earnings}
                        </p>
                      </div>
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, idx) => (
                    <div
                      key={`row-skeleton-${idx}`}
                      className="flex flex-col gap-2 rounded-lg border border-dashed border-border/80 p-4"
                    >
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="h-4 w-24 rounded-full" />
                    </div>
                  ))}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
