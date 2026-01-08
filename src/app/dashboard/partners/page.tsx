"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import type { ExportableData } from "@/components/data-table/utils/export-utils"
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
import userService, { type IUserReferral, type IUserReferralsParams } from "@/services/user.service"
import mlmEngineService from "@/services/mlm-engine.service"

interface ReferralTableRow extends ExportableData, IUserReferral {}

interface ReferralFetchParams {
  page: number
  limit: number
  search: string
  from_date: string
  to_date: string
  sort_by: string
  sort_order: "asc" | "desc"
}

type ReferralFetchArgs =
  | [ReferralFetchParams]
  | [
      number,
      number,
      string,
      { from_date: string; to_date: string },
      string,
      string,
      unknown?,
    ]

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
})

export default function PartnersPage() {
  const [ready, setReady] = useState(false)
  const skeletonCards = useMemo(() => Array.from({ length: 4 }), [])
  const { data: enabledModules } = useQuery({
    queryKey: ["mlm-enabled-modules"],
    queryFn: () => mlmEngineService.fetchEnabledModuleKeys(),
  })
  const isBinaryActive = enabledModules?.includes("binary")

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 600)
    return () => clearTimeout(timer)
  }, [])

  const referralColumns = useMemo<ColumnDef<ReferralTableRow, unknown>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <span className="font-semibold tracking-tight">{row.original.id}</span>
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.name?.trim() || "—"}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "lastName",
      header: "Last name",
      cell: ({ row }) => (
        <span>{row.original.lastName?.trim() || "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span>{row.original.phone?.trim() || "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <span>{row.original.country?.trim() || "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => (
        <span>{row.original.city?.trim() || "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => {
        const rawDate = row.original.createdAt
        const parsed = rawDate ? new Date(rawDate) : null
        const isValid = parsed && !Number.isNaN(parsed.getTime())

        return (
          <span className="text-sm text-muted-foreground">
            {isValid ? dateFormatter.format(parsed) : "—"}
          </span>
        )
      },
      enableSorting: true,
    },
  ], [])

  const fetchReferralData = useCallback(async (...args: ReferralFetchArgs) => {
    const params: IUserReferralsParams =
      typeof args[0] === "number"
        ? {
            page: args[0],
            limit: args[1] ?? 10,
            search: args[2] ?? "",
            from_date: args[3]?.from_date ?? "",
            to_date: args[3]?.to_date ?? "",
            sort_by: args[4] ?? "createdAt",
            sort_order: args[5] === "asc" ? "asc" : "desc",
          }
        : args[0]

    const response = isBinaryActive
      ? await userService.fetchBinaryPartners(params)
      : await userService.fetchUserReferrals(params)

    return {
      success: response.success,
      data: response.data,
      pagination: response.pagination,
    }
  }, [isBinaryActive])

  const referralExportConfig = useMemo(
    () => ({
      entityName: "partners",
      columnMapping: {
        id: "ID",
        name: "Name",
        lastName: "Last name",
        email: "Email",
        phone: "Phone",
        country: "Country",
        city: "City",
        createdAt: "Joined",
      },
      columnWidths: [
        { wch: 12 },
        { wch: 20 },
        { wch: 20 },
        { wch: 28 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
        { wch: 18 },
      ],
      headers: ["id", "name", "lastName", "email", "phone", "country", "city", "createdAt"],
      transformFunction: (row: ReferralTableRow) => {
        const parsed = row.createdAt ? new Date(row.createdAt) : null
        const formattedDate =
          parsed && !Number.isNaN(parsed.getTime())
            ? dateFormatter.format(parsed)
            : ""

        return {
          ...row,
          name: row.name?.trim() || "",
          lastName: row.lastName?.trim() || "",
          phone: row.phone?.trim() || "",
          country: row.country?.trim() || "",
          city: row.city?.trim() || "",
          createdAt: formattedDate,
        }
      },
    }),
    []
  )

  const referralTableConfig = useMemo(
    () => ({
      columnResizingTableId: "referral-leaderboard",
      defaultSortBy: "createdAt",
      defaultSortOrder: "desc" as const,
      enableColumnFilters: false,
      enableColumnVisibility: false,
      enableExport: false,
    }),
    []
  )

  const getReferralColumns = useCallback(
    () => referralColumns,
    [referralColumns]
  )

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
                  <BreadcrumbPage>Partners</BreadcrumbPage>
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
              <CardTitle>Partners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                config={referralTableConfig}
                getColumns={getReferralColumns}
                fetchDataFn={fetchReferralData}
                exportConfig={referralExportConfig}
                idField="id"
                pageSizeOptions={[10, 20, 30, 40, 50]}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
