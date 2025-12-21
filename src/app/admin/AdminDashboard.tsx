"use client"

import { useEffect, useState } from "react"

import { LanguagePicker } from "@/components/language/LanguagePicker"
import { PlanCards, SectionCards } from "@/components/ui/section-cards"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"

export function AdminDashboard() {
  const [cardsReady, setCardsReady] = useState(false)
  const skeletonCards = Array.from({ length: 4 })

  useEffect(() => {
    const timer = setTimeout(() => setCardsReady(true), 600)
    return () => clearTimeout(timer)
  }, [])

  return (
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
                <BreadcrumbLink href="/admin">
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto">
          <LanguagePicker inline />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {cardsReady ? (
          <SectionCards />
        ) : (
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 lg:px-6">
            {skeletonCards.map((_, index) => (
              <Card key={index} className="@container/card">
                <CardHeader>
                  <CardDescription>
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    <Skeleton className="h-9 w-24 rounded-md" />
                  </CardTitle>
                  <CardAction>
                    <Skeleton className="h-7 w-16 rounded-full" />
                  </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm w-full">
                  <div className="line-clamp-1 flex w-full gap-2 font-medium">
                    <Skeleton className="h-4 w-3/4 rounded-full" />
                  </div>
                  <div className="text-muted-foreground w-full">
                    <Skeleton className="h-4 w-2/3 rounded-full" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {cardsReady ? (
          <PlanCards />
        ) : (
          <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
            {skeletonCards.map((_, index) => (
              <Card key={`plan-${index}`} className="flex flex-col">
                <CardHeader>
                  <CardTitle>
                    <Skeleton className="h-6 w-24 rounded-md" />
                  </CardTitle>
                  <CardDescription>
                    <Skeleton className="h-4 w-32 rounded-full" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-2/3 rounded-full" />
                  <Skeleton className="h-4 w-1/2 rounded-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SidebarInset>
  )
}
