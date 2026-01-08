'use client'

import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CreditCard } from "lucide-react"

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { PayPalIcon } from "@/components/icons/paypal-icon"
import { TetherIcon } from "@/components/icons/tether-icon"
import { useProfile } from "@/hooks/useProfile"
import userService from "@/services/user.service"
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

function isValidTrc20Address(address: string) {
  if (!address) return true
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
}

function isValidCardNumber(cardNumber: string) {
  if (!cardNumber) return true
  const digits = cardNumber.replace(/[\s-]/g, "")
  if (!/^\d{12,19}$/.test(digits)) return false
  let sum = 0
  let shouldDouble = false
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }
  return sum % 10 === 0
}

function isValidEmail(email: string) {
  if (!email) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function WalletPage() {
  const skeletonCards = Array.from({ length: 2 })
  const { user, refetch: refetchProfile } = useProfile()
  const payoutDefaultsRef = useRef({
    creditCard: "",
    paypal: "",
    usdt: "",
  })
  const [payoutDetails, setPayoutDetails] = useState({
    creditCard: "",
    paypal: "",
    usdt: "",
  })
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [detailsMessage, setDetailsMessage] = useState<string | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [withdrawMethod, setWithdrawMethod] = useState("")
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => walletService.fetchWallet(),
  })
  const { data: transactionsPage, isLoading: transactionsLoading } = useQuery({
    queryKey: ["wallet-transactions", page],
    queryFn: () => walletService.fetchTransactions(pageSize, page),
  })
  const isLoading = walletLoading || transactionsLoading
  const balanceText = formatCurrency(wallet?.balance ?? 0, wallet?.currency ?? null)
  const transactions = transactionsPage?.items ?? []
  const totalPages = Math.max(
    1,
    Math.ceil((transactionsPage?.total ?? 0) / pageSize)
  )
  const detailsDirty =
    payoutDetails.creditCard !== payoutDefaultsRef.current.creditCard ||
    payoutDetails.paypal !== payoutDefaultsRef.current.paypal ||
    payoutDetails.usdt !== payoutDefaultsRef.current.usdt
  const cardError = isValidCardNumber(payoutDetails.creditCard)
    ? null
    : "Enter a valid card number."
  const paypalError = isValidEmail(payoutDetails.paypal)
    ? null
    : "Enter a valid PayPal email."
  const usdtError = isValidTrc20Address(payoutDetails.usdt)
    ? null
    : "Enter a valid TRC20 address."
  const availableMethods = useMemo(() => {
    const methods: { value: string; label: string }[] = []
    if (payoutDetails.creditCard) {
      methods.push({ value: "creditCard", label: "Credit card" })
    }
    if (payoutDetails.paypal) {
      methods.push({ value: "paypal", label: "PayPal" })
    }
    if (payoutDetails.usdt) {
      methods.push({ value: "usdt", label: "USDT (TRC20)" })
    }
    return methods
  }, [payoutDetails.creditCard, payoutDetails.paypal, payoutDetails.usdt])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    if (!withdrawOpen) return
    if (!withdrawMethod && availableMethods.length > 0) {
      setWithdrawMethod(availableMethods[0].value)
    }
  }, [withdrawOpen, withdrawMethod, availableMethods])

  useEffect(() => {
    const next = {
      creditCard: user?.payoutCreditCard ?? "",
      paypal: user?.payoutPaypal ?? "",
      usdt: user?.payoutUsdt ?? "",
    }
    setPayoutDetails(next)
    payoutDefaultsRef.current = next
  }, [user?.payoutCreditCard, user?.payoutPaypal, user?.payoutUsdt])

  const handleSaveDetails = async () => {
    setDetailsSaving(true)
    setDetailsMessage(null)
    try {
      await userService.updateProfile({
        payoutCreditCard: payoutDetails.creditCard || null,
        payoutPaypal: payoutDetails.paypal || null,
        payoutUsdt: payoutDetails.usdt || null,
      })
      payoutDefaultsRef.current = { ...payoutDetails }
      setDetailsMessage("Details saved.")
      await refetchProfile()
    } catch {
      setDetailsMessage("Unable to save details.")
    } finally {
      setDetailsSaving(false)
    }
  }

  const availableBalance = (wallet?.balance ?? 0) / 100
  const normalizedAmount = withdrawAmount.replace(",", ".")
  const parsedAmount = Number.parseFloat(normalizedAmount)
  const amountError =
    withdrawAmount.trim().length === 0
      ? "Enter amount."
      : Number.isNaN(parsedAmount) || parsedAmount <= 0
        ? "Enter a valid amount."
        : parsedAmount > availableBalance
          ? "Amount exceeds available balance."
          : null
  const methodError =
    availableMethods.length === 0
      ? "Add withdrawal details first."
      : withdrawMethod
        ? null
        : "Select a withdrawal method."

  const handleConfirmWithdraw = () => {
    if (amountError || methodError) return
    setWithdrawMessage("Withdrawal request submitted.")
    setWithdrawAmount("")
    setWithdrawMethod("")
    setWithdrawOpen(false)
  }

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
                    <div className="text-center">
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
                <button
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={() => {
                    setWithdrawMessage(null)
                    setWithdrawOpen(true)
                  }}
                  type="button"
                >
                  Withdraw
                </button>
              </CardFooter>
              <CardContent className="pt-0">
                <Separator className="my-4" />
                <div className="space-y-3">
                  <p className="text-sm font-semibold">
                    Your withdrawal details
                  </p>
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <CreditCard className="h-4 w-4" />
                        <span className="sr-only">Credit Card</span>
                      </label>
                      <Input
                        value={payoutDetails.creditCard}
                        onChange={(event) =>
                          setPayoutDetails((prev) => ({
                            ...prev,
                            creditCard: event.target.value
                          }))
                        }
                        placeholder="Card number"
                      />
                      {cardError ? (
                        <p className="text-xs text-destructive">{cardError}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <PayPalIcon />
                        <span className="sr-only">PayPal</span>
                      </label>
                      <Input
                        value={payoutDetails.paypal}
                        onChange={(event) =>
                          setPayoutDetails((prev) => ({
                            ...prev,
                            paypal: event.target.value
                          }))
                        }
                        placeholder="PayPal email"
                      />
                      {paypalError ? (
                        <p className="text-xs text-destructive">{paypalError}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <TetherIcon />
                        <span className="sr-only">USDT</span>
                      </label>
                      <Input
                        value={payoutDetails.usdt}
                        onChange={(event) =>
                          setPayoutDetails((prev) => ({
                            ...prev,
                            usdt: event.target.value
                          }))
                        }
                        placeholder="USDT TRC20 address"
                      />
                      {usdtError ? (
                        <p className="text-xs text-destructive">{usdtError}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{detailsMessage}</span>
                    <button
                      className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500/90 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleSaveDetails}
                      disabled={
                        detailsSaving ||
                        !detailsDirty ||
                        Boolean(usdtError) ||
                        Boolean(cardError) ||
                        Boolean(paypalError)
                      }
                      type="button"
                    >
                      {detailsSaving ? "Saving..." : "Save details"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen} modal={false}>
              <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md md:left-[calc(50%+8rem)]">
                <DialogHeader>
                  <DialogTitle>Withdraw funds</DialogTitle>
                  <DialogDescription>
                    Enter the amount and choose a withdrawal method.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(event) => setWithdrawAmount(event.target.value)}
                      placeholder={`Available: ${availableBalance.toFixed(2)}`}
                    />
                    {amountError ? (
                      <p className="text-xs text-destructive">{amountError}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Withdrawal method
                    </label>
                    {availableMethods.length > 0 ? (
                      <div className="grid gap-2">
                        {availableMethods.map((method) => (
                          <button
                            key={method.value}
                            type="button"
                            className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
                              withdrawMethod === method.value
                                ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-200"
                                : "border-white/10 text-muted-foreground hover:text-white"
                            }`}
                            onClick={() => setWithdrawMethod(method.value)}
                          >
                            <span>{method.label}</span>
                            {withdrawMethod === method.value ? (
                              <span className="text-xs">Selected</span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        Add withdrawal details first.
                      </div>
                    )}
                    {methodError ? (
                      <p className="text-xs text-destructive">{methodError}</p>
                    ) : null}
                  </div>
                  {withdrawMessage ? (
                    <p className="text-xs text-emerald-400">
                      {withdrawMessage}
                    </p>
                  ) : null}
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setWithdrawOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmWithdraw}
                      disabled={Boolean(amountError) || Boolean(methodError)}
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Card>
              <CardHeader>
                <CardTitle>Recent transactions</CardTitle>
                <CardDescription>
                  Overview of the latest deposits, payouts, and conversions.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-[560px] flex-col gap-4">
                {!isLoading && transactions.length > 0 ? (
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
                {!isLoading && transactionsPage && transactionsPage.total > 0 ? (
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <button
                      className="rounded-md border border-border/70 px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      disabled={page <= 1}
                      type="button"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      className="rounded-md border border-border/70 px-3 py-1 text-sm text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() =>
                        setPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={page >= totalPages}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
    </SidebarInset>
  )
}
