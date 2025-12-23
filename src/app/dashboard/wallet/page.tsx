'use client'

import { useQuery } from "@tanstack/react-query"

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
  CardFooter,
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
import walletService, { type WalletTransaction } from "@/services/wallet.service"

function formatCurrency(amount: number, currency: string | null) {
  const value = amount / 100
  if (!currency) return value.toFixed(2)
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

function getSourceName(transaction: WalletTransaction) {
  const source = transaction.payout?.sourceUser
  if (!source) return "Unknown user"
  const fullName = [source.name, source.lastName].filter(Boolean).join(" ")
  return fullName || source.email || source.id
}

export default function WalletPage() {
  const skeletonCards = Array.from({ length: 2 })
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletService.fetchWallet(),
  })
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions"],
    queryFn: () => walletService.fetchTransactions(20),
  })
  const isLoading = walletLoading || transactionsLoading
  const balanceText = formatCurrency(wallet?.balance ?? 0, wallet?.currency ?? null)

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
                  <BreadcrumbPage>Wallet</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto">
            <LanguagePicker inline />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {!isLoading ? (
            <SectionCards />
          ) : (
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 lg:px-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`wallet-skeleton-${index}`} className="@container/card">
                  <CardHeader>
                    <CardDescription>
                      <Skeleton className="h-4 w-28 rounded-full" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-2/3 rounded-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="flex flex-col">
              <CardHeader>
                <CardTitle>Wallet balance</CardTitle>
                <CardDescription>
                  Monitor funds and run quick top-ups or withdrawals.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!isLoading ? (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Available balance
                      </p>
                      <p className="text-4xl font-semibold tabular-nums">
                        {balanceText}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-32 rounded-full" />
                    <Skeleton className="h-10 w-48 rounded-md" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center">
                <button className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                  Withdraw
                </button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>
                  Overview of the latest deposits, payouts, and conversions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isLoading && transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => {
                    const sourceName = getSourceName(transaction)
                    const amountLabel = formatCurrency(
                      Math.abs(transaction.amount),
                      transaction.currency
                    )
                    const prefix = transaction.type === "DEBIT" ? "-" : "+"
                    const subtitleParts = [
                      transaction.payout
                        ? `Level ${transaction.payout.level}`
                        : null,
                      transaction.payout ? `${transaction.payout.percent}%` : null,
                      new Date(transaction.createdAt).toLocaleDateString(),
                    ].filter(Boolean)
                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg border border-border/70 p-4"
                      >
                        <div>
                          <p className="font-semibold">
                            {transaction.payout
                              ? `Payout from ${sourceName}`
                              : "Wallet transaction"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {subtitleParts.join(" • ")}
                          </p>
                        </div>
                        <p className="text-lg font-semibold tabular-nums">
                          {prefix}
                          {amountLabel}
                        </p>
                      </div>
                    )
                  })
                ) : !isLoading ? (
                  <div className="text-sm text-muted-foreground">
                    No transactions yet.
                  </div>
                ) : (
                  skeletonCards.map((_, idx) => (
                    <div
                      key={`transaction-skeleton-${idx}`}
                      className="rounded-lg border border-dashed border-border/70 p-4"
                    >
                      <Skeleton className="h-4 w-40 rounded-full" />
                      <Skeleton className="mt-2 h-4 w-24 rounded-full" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
