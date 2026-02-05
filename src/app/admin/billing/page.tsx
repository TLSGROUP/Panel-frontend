'use client'

import { useCallback, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"

import { LanguagePicker } from "@/components/language/LanguagePicker"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import type { ExportableData } from "@/components/data-table/utils/export-utils"
import { Button } from "@/components/ui/button"
import { instance } from "@/api/axios"
import { toast } from "sonner"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import paymentService, { type BillingHistoryItem } from "@/services/payment.service"
import withdrawalService, { type WithdrawalRequest } from "@/services/withdrawal.service"

interface BillingTableRow extends ExportableData, BillingHistoryItem {}
interface WithdrawalTableRow extends ExportableData, WithdrawalRequest {}

interface BillingFetchParams {
  page: number
  limit: number
  search: string
  from_date: string
  to_date: string
  sort_by: string
  sort_order: "asc" | "desc"
}

type BillingFetchArgs =
  | [BillingFetchParams]
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

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export default function BillingPage() {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsRequest, setDetailsRequest] = useState<WithdrawalRequest | null>(
    null
  )
  const handleReceiptDownload = useCallback(async (receiptUrl: string) => {
    try {
      const response = await instance.get<Blob>("/media/download", {
        params: { path: receiptUrl },
        responseType: "blob",
      })
      const blobUrl = URL.createObjectURL(response.data)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = receiptUrl.split("/").pop() || "receipt"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Failed to download receipt", error)
      toast.error("Failed to download receipt")
    }
  }, [])
  const historyColumns = useMemo<ColumnDef<BillingTableRow, unknown>[]>(() => [
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const parsed = new Date(row.original.createdAt)
        return (
          <span className="text-sm text-muted-foreground">
            {Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed)}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs">
          {row.original.type}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "plan",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plan" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.original.plan || "—"}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums">
          {formatCurrency(row.original.amount, row.original.currency)}
        </span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "currency",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Currency" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.currency}</span>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status
        const label =
          status === "PAID" || status === "SUCCEEDED"
            ? "Paid"
            : status === "FAILED"
              ? "Failed"
              : status === "CANCELED"
                ? "Canceled"
                : "Pending"
        const tone =
          status === "PAID" || status === "SUCCEEDED"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            : status === "FAILED"
              ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
              : status === "CANCELED"
                ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                : "border-amber-500/40 bg-amber-500/10 text-amber-200"
        return (
          <span className={`rounded-full border px-3 py-1 text-xs ${tone}`}>
            {label}
          </span>
        )
      },
      enableSorting: true,
    },
    {
      accessorKey: "source",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source" />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.source || "—"}</span>
      ),
      enableSorting: true,
    },
  ], [])

  const withdrawalColumns = useMemo<ColumnDef<WithdrawalTableRow, unknown>[]>(
    () => [
      {
        accessorKey: "requestId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Request ID" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.requestId}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "currency",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Currency" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.currency}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "method",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Method" />
        ),
        cell: ({ row }) => (
          <span className="text-sm">{row.original.method}</span>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status
          const label =
            status === "PAID"
              ? "Paid"
              : status === "REJECTED"
                ? "Rejected"
                : "Pending"
          const tone =
            status === "PAID"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : status === "REJECTED"
                ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                : "border-amber-500/40 bg-amber-500/10 text-amber-200"
          return (
            <span className={`rounded-full border px-3 py-1 text-xs ${tone}`}>
              {label}
            </span>
          )
        },
        enableSorting: true,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Requested" />
        ),
        cell: ({ row }) => {
          const parsed = new Date(row.original.createdAt)
          return (
            <span className="text-sm text-muted-foreground">
              {Number.isNaN(parsed.getTime()) ? "—" : dateFormatter.format(parsed)}
            </span>
          )
        },
        enableSorting: true,
      },
      {
        id: "details",
        header: "Details",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDetailsRequest(row.original)
              setDetailsOpen(true)
            }}
          >
            View
          </Button>
        ),
      },
    ],
    []
  )

  const fetchHistoryData = useCallback(async (...args: BillingFetchArgs) => {
    const params: BillingFetchParams =
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

    const response = await paymentService.fetchBillingHistory({
      page: params.page,
      limit: params.limit,
      search: params.search,
      from_date: params.from_date,
      to_date: params.to_date,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    })

    return {
      success: response.success,
      data: response.data,
      pagination: response.pagination,
    }
  }, [])

  const fetchWithdrawalData = useCallback(async (...args: BillingFetchArgs) => {
    const params: BillingFetchParams =
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

    const response = await withdrawalService.fetchMyRequests({
      page: params.page,
      limit: params.limit,
      search: params.search,
      from_date: params.from_date,
      to_date: params.to_date,
      sort_by: params.sort_by,
      sort_order: params.sort_order,
    })

    return {
      success: response.success,
      data: response.data,
      pagination: response.pagination,
    }
  }, [])

  const historyExportConfig = useMemo(
    () => ({
      entityName: "billing-history",
      columnMapping: {
        createdAt: "Date",
        type: "Type",
        plan: "Plan",
        amount: "Amount",
        currency: "Currency",
        status: "Status",
        source: "Source",
      },
      columnWidths: [
        { wch: 14 },
        { wch: 12 },
        { wch: 18 },
        { wch: 12 },
        { wch: 10 },
        { wch: 12 },
        { wch: 22 },
      ],
      headers: ["Date", "Type", "Plan", "Amount", "Currency", "Status", "Source"],
    }),
    []
  )

  const historyTableConfig = useMemo(
    () => ({
      enableRowSelection: false,
      enableClickRowSelect: false,
      enableSearch: true,
      enableColumnFilters: false,
      enableDateFilter: true,
      enableUrlState: false,
      enableExport: false,
      enableToolbar: true,
      columnResizingTableId: "billing-history-admin",
      defaultSortBy: "createdAt",
      defaultSortOrder: "desc",
    }),
    []
  )

  const withdrawalsTableConfig = useMemo(
    () => ({
      enableRowSelection: false,
      enableClickRowSelect: false,
      enableSearch: true,
      enableColumnFilters: false,
      enableDateFilter: true,
      enableUrlState: false,
      enableExport: false,
      enableToolbar: true,
      columnResizingTableId: "billing-withdrawals-admin",
      defaultSortBy: "createdAt",
      defaultSortOrder: "desc",
    }),
    []
  )

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
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Billing</BreadcrumbPage>
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
              <CardTitle>Billing history</CardTitle>
              <CardDescription>
                All plan payments and reward payouts in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                config={historyTableConfig}
                getColumns={() => historyColumns}
                fetchDataFn={fetchHistoryData}
                exportConfig={historyExportConfig}
                idField="id"
                pageSizeOptions={[5, 10, 20]}
                keepPreviousData
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal requests</CardTitle>
              <CardDescription>
                Track your submitted payout requests and their status.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                config={withdrawalsTableConfig}
                getColumns={() => withdrawalColumns}
                fetchDataFn={fetchWithdrawalData}
                exportConfig={{
                  entityName: "withdrawal-requests",
                  columnMapping: {
                    requestId: "Request ID",
                    amount: "Amount",
                    currency: "Currency",
                    method: "Method",
                    status: "Status",
                    createdAt: "Requested",
                  },
                  columnWidths: [
                    { wch: 16 },
                    { wch: 12 },
                    { wch: 10 },
                    { wch: 16 },
                    { wch: 12 },
                    { wch: 14 },
                  ],
                  headers: [
                    "Request ID",
                    "Amount",
                    "Currency",
                    "Method",
                    "Status",
                    "Requested",
                  ],
                }}
                idField="id"
                pageSizeOptions={[5, 10, 20]}
                keepPreviousData
              />
            </CardContent>
          </Card>
        </div>
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen} modal={false}>
          <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md md:left-[calc(50%+8rem)]">
            <DialogHeader>
              <DialogTitle>Withdrawal details</DialogTitle>
              <DialogDescription>Review your payout request.</DialogDescription>
            </DialogHeader>
            {detailsRequest ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Request ID</p>
                    <p className="text-base font-semibold">
                      {detailsRequest.requestId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-base font-semibold">
                      {formatCurrency(
                        detailsRequest.amount,
                        detailsRequest.currency
                      )}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Method</span>
                    <span>{detailsRequest.method}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span>{detailsRequest.status}</span>
                  </div>
                </div>
                {detailsRequest.method.toLowerCase().includes("usdt") ? (
                  detailsRequest.txHash ? (
                    <Button asChild variant="outline" className="w-full">
                      <a
                        href={`https://tronscan.org/#/transaction/${detailsRequest.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View transaction on Tronscan
                      </a>
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Transaction hash not provided yet.
                    </div>
                  )
                ) : detailsRequest.receiptUrl ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleReceiptDownload(detailsRequest.receiptUrl!)}
                  >
                    Download receipt
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Receipt not uploaded yet.
                  </div>
                )}
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
    </SidebarInset>
  )
}
