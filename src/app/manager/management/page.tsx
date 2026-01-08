"use client"

import { useCallback, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { ManagerSidebar } from "@/components/manager-sidebar"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import type { ExportableData } from "@/components/data-table/utils/export-utils"
import { LanguagePicker } from "@/components/language/LanguagePicker"
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

type WithdrawRequestRow = ExportableData & {
  id: string
  userId: string
  name: string
  lastName: string
  email: string
  amount: number
  method: string
  details: string
  status: string
  requestedAt: string
}

const withdrawRequests: WithdrawRequestRow[] = [
  {
    id: "WR-2301",
    userId: "U-1024",
    name: "Alex",
    lastName: "Morgan",
    email: "alex.morgan@example.com",
    amount: 250,
    method: "USDT (TRC20)",
    details: "USDT (TRC20): TQ8Z...P9JL",
    status: "Pending",
    requestedAt: "2024-11-06",
  },
  {
    id: "WR-2298",
    userId: "U-1008",
    name: "Jamie",
    lastName: "Chen",
    email: "jamie.chen@example.com",
    amount: 120,
    method: "PayPal",
    details: "PayPal: jamie.chen@example.com",
    status: "Pending",
    requestedAt: "2024-11-05",
  },
  {
    id: "WR-2294",
    userId: "U-0988",
    name: "Sara",
    lastName: "Lee",
    email: "sara.lee@example.com",
    amount: 340,
    method: "Credit card",
    details: "Card: **** 4242",
    status: "Approved",
    requestedAt: "2024-11-03",
  },
  {
    id: "WR-2289",
    userId: "U-0963",
    name: "Ivan",
    lastName: "Petrov",
    email: "ivan.petrov@example.com",
    amount: 90,
    method: "USDT (TRC20)",
    details: "USDT (TRC20): TX2L...K7QF",
    status: "Pending",
    requestedAt: "2024-11-02",
  },
  {
    id: "WR-2281",
    userId: "U-0934",
    name: "Nora",
    lastName: "King",
    email: "nora.king@example.com",
    amount: 480,
    method: "PayPal",
    details: "PayPal: nora.king@example.com",
    status: "Rejected",
    requestedAt: "2024-10-29",
  },
  {
    id: "WR-2276",
    userId: "U-0907",
    name: "Liam",
    lastName: "Ross",
    email: "liam.ross@example.com",
    amount: 75,
    method: "Credit card",
    details: "Card: **** 1134",
    status: "Pending",
    requestedAt: "2024-10-27",
  },
]

export default function ManagerManagementPage() {
  const requestColumns = useMemo<ColumnDef<WithdrawRequestRow, unknown>[]>(() => [
    {
      accessorKey: "id",
      header: "Request ID",
      cell: ({ row }) => (
        <span className="font-semibold tracking-tight">{row.original.id}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "userId",
      header: "User ID",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.userId}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "lastName",
      header: "Last name",
      cell: ({ row }) => <span>{row.original.lastName}</span>,
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
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold">${row.original.amount.toFixed(2)}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "method",
      header: "Method",
      cell: ({ row }) => <span>{row.original.method}</span>,
      enableSorting: true,
    },
    {
      accessorKey: "details",
      header: "Details",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.details}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <span
          className={`rounded-full border px-3 py-1 text-xs ${
            row.original.status === "Approved"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : row.original.status === "Rejected"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          }`}
        >
          {row.original.status}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "requestedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.requestedAt}
        </span>
      ),
      enableSorting: true,
    },
  ], [])

  const fetchRequests = useCallback(
    async ({
      page,
      limit,
      search,
      sort_by,
      sort_order,
    }: {
      page: number
      limit: number
      search: string
      from_date: string
      to_date: string
      sort_by: string
      sort_order: string
    }) => {
      const normalizedSearch = search.trim().toLowerCase()
      const filtered = normalizedSearch
        ? withdrawRequests.filter((item) => {
            const haystack = [
              item.id,
              item.userId,
              item.name,
              item.lastName,
              item.email,
              item.method,
              item.details,
              item.status,
            ]
              .join(" ")
              .toLowerCase()
            return haystack.includes(normalizedSearch)
          })
        : withdrawRequests

      const sorted = [...filtered].sort((a, b) => {
        const direction = sort_order === "asc" ? 1 : -1
        const field = sort_by as keyof WithdrawRequestRow
        const left = a[field]
        const right = b[field]
        if (typeof left === "number" && typeof right === "number") {
          return (left - right) * direction
        }
        return String(left).localeCompare(String(right)) * direction
      })

      const total_items = sorted.length
      const total_pages = Math.max(1, Math.ceil(total_items / limit))
      const start = (page - 1) * limit
      const data = sorted.slice(start, start + limit)

      return {
        success: true,
        data,
        pagination: {
          page,
          limit,
          total_pages,
          total_items,
        },
      }
    },
    []
  )

  const requestTableConfig = useMemo(
    () => ({
      columnResizingTableId: "withdraw-requests-manager",
      defaultSortBy: "requestedAt",
      defaultSortOrder: "desc" as const,
      enableColumnFilters: false,
      enableColumnVisibility: false,
      enableExport: false,
    }),
    []
  )

  const requestExportConfig = useMemo(
    () => ({
      entityName: "withdraw-requests",
      columnMapping: {
        id: "Request ID",
        userId: "User ID",
        name: "Name",
        lastName: "Last name",
        email: "Email",
        amount: "Amount",
        method: "Method",
        details: "Details",
        status: "Status",
        requestedAt: "Requested",
      },
      columnWidths: [
        { wch: 12 },
        { wch: 12 },
        { wch: 16 },
        { wch: 16 },
        { wch: 28 },
        { wch: 10 },
        { wch: 16 },
        { wch: 32 },
        { wch: 12 },
        { wch: 14 },
      ],
      headers: [
        "id",
        "userId",
        "name",
        "lastName",
        "email",
        "amount",
        "method",
        "details",
        "status",
        "requestedAt",
      ],
    }),
    []
  )

  return (
    <SidebarProvider>
      <ManagerSidebar />
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
                  <BreadcrumbLink href="/manager">Manager</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Withdraw requests</BreadcrumbPage>
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
              <CardTitle>Withdraw requests</CardTitle>
              <CardDescription>
                Review payout requests and manage approvals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                config={requestTableConfig}
                getColumns={() => requestColumns}
                fetchDataFn={fetchRequests}
                exportConfig={requestExportConfig}
                idField="id"
                pageSizeOptions={[5, 10, 20]}
              />
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
