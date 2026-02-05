"use client"

import { useCallback, useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import toast from "react-hot-toast"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import withdrawalService, {
  type WithdrawalRequest,
  type WithdrawalsParams,
} from "@/services/withdrawal.service"
import { FileService } from "@/services/file.service"
import { instance } from "@/api/axios"

type WithdrawRequestRow = ExportableData & WithdrawalRequest

export default function ManagerManagementPage() {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsValue, setDetailsValue] = useState<string | null>(null)
  const [detailsAmount, setDetailsAmount] = useState<number | null>(null)
  const [detailsMethod, setDetailsMethod] = useState<string | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [detailsStatus, setDetailsStatus] = useState<string | null>(null)
  const [detailsReceiptUrl, setDetailsReceiptUrl] = useState<string | null>(null)
  const [detailsTxHash, setDetailsTxHash] = useState<string | null>(null)
  const [txHash, setTxHash] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [refreshToken, setRefreshToken] = useState(0)
  const receiptInputId = "manager-withdraw-receipt"
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    []
  )
  const requestColumns = useMemo<ColumnDef<WithdrawRequestRow, unknown>[]>(() => [
    {
      accessorKey: "requestId",
      header: "Request ID",
      cell: ({ row }) => (
        <span className="font-semibold tracking-tight">
          {row.original.requestId}
        </span>
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
        <button
          type="button"
          className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500/90"
          onClick={() => {
            setDetailsValue(row.original.details)
            setDetailsAmount(row.original.amount)
            setDetailsMethod(row.original.method)
            setDetailsId(row.original.id)
            setDetailsStatus(row.original.status)
            setDetailsReceiptUrl(row.original.receiptUrl ?? null)
            setDetailsTxHash(row.original.txHash ?? null)
            setTxHash("")
            setReceiptFile(null)
            setRejectReason("")
            setDetailsOpen(true)
          }}
        >
          View
        </button>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        (() => {
          const status = row.original.status
          const label =
            status === "PAID" ? "Paid" : status === "REJECTED" ? "Rejected" : "Pending"
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
        })()
      ),
      enableSorting: true,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Requested" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(() => {
            const parsed = new Date(row.original.createdAt)
            return Number.isNaN(parsed.getTime())
              ? "—"
              : dateFormatter.format(parsed)
          })()}
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
      from_date,
      to_date,
      sort_by,
      sort_order,
    }: WithdrawalsParams & {
      page: number
      limit: number
      search: string
      from_date: string
      to_date: string
      sort_by: string
      sort_order: string
    }) => {
      return withdrawalService.fetchRequests({
        page,
        limit,
        search,
        from_date,
        to_date,
        sort_by,
        sort_order,
      })
    },
    []
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

  const requestTableConfig = useMemo(
    () => ({
      columnResizingTableId: "withdraw-requests-manager",
      defaultSortBy: "createdAt",
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
        requestId: "Request ID",
        userId: "User ID",
        name: "Name",
        lastName: "Last name",
        email: "Email",
        amount: "Amount",
        method: "Method",
        details: "Details",
        status: "Status",
        createdAt: "Requested",
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
        "requestId",
        "userId",
        "name",
        "lastName",
        "email",
        "amount",
        "method",
        "details",
        "status",
        "createdAt",
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
              refreshToken={refreshToken}
              keepPreviousData
            />
            </CardContent>
          </Card>
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen} modal={false}>
          <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md md:left-[calc(50%+8rem)]">
            <DialogHeader>
              <DialogTitle>Withdrawal details</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <DialogDescription>Withdrawal method details</DialogDescription>
              <div className="relative">
                <Input
                  value={detailsValue ?? ""}
                  readOnly
                  className="pr-24"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 h-7 -translate-y-1/2 px-2"
                  onClick={async () => {
                    if (detailsValue) {
                      await navigator.clipboard.writeText(detailsValue)
                      toast.success("Copied")
                    }
                  }}
                  disabled={!detailsValue}
                >
                  Copy details
                </Button>
              </div>
            </div>
            {detailsAmount !== null ? (
              <div className="text-sm text-muted-foreground">
                Amount requested:{" "}
                <span className="font-semibold text-white">
                  ${detailsAmount.toFixed(2)}
                </span>
              </div>
            ) : null}
            {detailsStatus === "PAID" ? (
              detailsMethod?.toLowerCase().includes("usdt") ? (
                detailsTxHash ? (
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href={`https://tronscan.org/#/transaction/${detailsTxHash}`}
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
              ) : detailsReceiptUrl ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleReceiptDownload(detailsReceiptUrl)}
                >
                  Download receipt
                </Button>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Receipt not uploaded yet.
                </div>
              )
            ) : detailsMethod?.toLowerCase().includes("usdt") ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">Transaction hash</label>
                <Input
                  value={txHash}
                  onChange={(event) => setTxHash(event.target.value)}
                  placeholder="Paste transaction hash"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Upload payout receipt
                </label>
                <input
                  id={receiptInputId}
                  type="file"
                  accept=".png,.jpg,.jpeg,application/pdf"
                  className="sr-only"
                  onChange={(event) =>
                    setReceiptFile(event.target.files?.[0] ?? null)
                  }
                />
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      document.getElementById(receiptInputId)?.click()
                    }}
                    type="button"
                  >
                    Choose file
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {receiptFile?.name ?? "No file chosen"}
                  </span>
                </div>
              </div>
            )}
            {detailsStatus !== "PAID" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Rejection reason
                  </label>
                  <Input
                    value={rejectReason}
                    onChange={(event) => setRejectReason(event.target.value)}
                    placeholder="Provide a reason for rejection"
                  />
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      if (!detailsId || !rejectReason.trim()) return
                      try {
                        await withdrawalService.updateRequest(detailsId, {
                          status: "REJECTED",
                          rejectReason: rejectReason.trim(),
                        })
                        toast.success("Request rejected")
                        setDetailsOpen(false)
                        setRefreshToken((prev) => prev + 1)
                      } catch {
                        toast.error("Failed to reject request")
                      }
                    }}
                    disabled={!detailsId || rejectReason.trim().length === 0}
                  >
                    Rejected
                  </Button>
                  <Button
                    onClick={async () => {
                      if (!detailsId) return
                      const isUsdt = detailsMethod?.toLowerCase().includes("usdt")
                      if (isUsdt && !txHash.trim()) return
                      if (!isUsdt && !receiptFile) return
                      try {
                        let receiptUrl: string | undefined
                        if (!isUsdt && receiptFile) {
                          const formData = new FormData()
                          formData.append("media", receiptFile)
                          const uploadResponse = await FileService.upload(
                            formData,
                            "withdrawals"
                          )
                          receiptUrl = uploadResponse.data?.[0]?.url
                        }

                        await withdrawalService.updateRequest(detailsId, {
                          status: "PAID",
                          txHash: isUsdt ? txHash.trim() : undefined,
                          receiptUrl,
                        })
                        toast.success("Request confirmed")
                        setDetailsOpen(false)
                        setRefreshToken((prev) => prev + 1)
                      } catch {
                        toast.error("Failed to confirm request")
                      }
                    }}
                    disabled={
                      !detailsId ||
                      (detailsMethod?.toLowerCase().includes("usdt")
                        ? !txHash.trim()
                        : !receiptFile)
                    }
                  >
                    Confirm
                  </Button>
                </div>
              </>
            ) : null}
          </DialogContent>
        </Dialog>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
