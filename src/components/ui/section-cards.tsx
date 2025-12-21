"use client"

import { useMemo, useState } from "react"
import { CreditCard, TrendingDown, TrendingUp } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { CardElement, Elements, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { FaPaypal } from "react-icons/fa"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import paymentService, { type PlanCatalogItem } from "@/services/payment.service"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            $1,250.00
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Visitors for the last 6 months
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>New Referals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,234
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Acquisition needs attention
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Referals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong user retention <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady performance increase <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Meets growth projections</div>
        </CardFooter>
      </Card>
    </div>
  )
}

const planStyleMap: Record<string, string> = {
  bronze: "text-amber-700",
  silver: "text-slate-200",
  gold: "text-yellow-400",
  brilliant: "text-sky-200",
}

const fallbackPlans: PlanCatalogItem[] = [
  {
    id: "bronze",
    name: "Bronze",
    amount: 1900,
    currency: "EUR",
    description: "Ideal for freelancers and mini teams.",
    features: ["1 project", "Basic analytics", "Email support"],
  },
  {
    id: "silver",
    name: "Silver",
    amount: 4900,
    currency: "EUR",
    description: "For teams that grow steadily.",
    features: ["5 projects", "Advanced analytics", "Priority support"],
  },
  {
    id: "gold",
    name: "Gold",
    amount: 9900,
    currency: "EUR",
    description: "Optimized for agencies and startups.",
    features: ["Unlimited projects", "Automation tools", "Account manager"],
  },
  {
    id: "brilliant",
    name: "Brilliant",
    amount: 19900,
    currency: "EUR",
    description: "Complete toolkit for enterprises.",
    features: ["All Pro features", "99.9% SLA", "Custom onboarding"],
  },
]

function formatPlanPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount / 100)
}

function PlanPaymentForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setErrorMessage(null)

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setErrorMessage("Payment form is not ready yet.")
      setIsSubmitting(false)
      return
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    })

    if (result.error) {
      setErrorMessage(result.error.message ?? "Payment failed.")
      setIsSubmitting(false)
      return
    }

    if (result.paymentIntent?.status === "succeeded") {
      onSuccess()
    } else {
      setErrorMessage("Payment requires additional action.")
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 p-3">
        <CardElement
          options={{
            style: {
              base: {
                color: "#ffffff",
                fontSize: "16px",
              },
            },
          }}
        />
      </div>
      {errorMessage && (
        <div className="text-sm text-destructive">{errorMessage}</div>
      )}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!stripe || isSubmitting}
      >
        {isSubmitting ? "Processing..." : "Pay now"}
      </Button>
    </div>
  )
}

export function PlanCards() {
  const [selectedPlan, setSelectedPlan] = useState<PlanCatalogItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal" | null>(
    null
  )
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [intentLoading, setIntentLoading] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)
  const [paypalError, setPaypalError] = useState<string | null>(null)
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null)
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  const { data: planData } = useQuery({
    queryKey: ["plans"],
    queryFn: () => paymentService.fetchPlans(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 5000,
  })


  const { data: stripeKey } = useQuery({
    queryKey: ["stripe-public-key"],
    queryFn: () => paymentService.fetchPublicKey(),
  })

  const { data: paypalKey } = useQuery({
    queryKey: ["paypal-client-id"],
    queryFn: () => paymentService.fetchPayPalClientId(),
  })

  const plans = planData?.length ? planData : fallbackPlans

  const stripePromise = useMemo(() => {
    if (!stripeKey?.publicKey) return null
    return loadStripe(stripeKey.publicKey)
  }, [stripeKey?.publicKey])

  const openCheckout = async (plan: PlanCatalogItem) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
    setPaymentMethod(null)
    setPaymentSuccess(false)
    setClientSecret(null)
    setIntentError(null)
    setPaymentId(null)
    setPaypalError(null)
    setPaypalOrderId(null)
  }

  const startStripeCheckout = async () => {
    if (!selectedPlan) return
    setPaymentMethod("stripe")

    try {
      setIntentLoading(true)
      const response = await paymentService.createPaymentIntent(selectedPlan.id)
      setClientSecret(response.clientSecret)
      setPaymentId(response.paymentId)
    } catch (error) {
      setIntentError("Unable to start payment. Please try again.")
    } finally {
      setIntentLoading(false)
    }
  }

  const startPayPalCheckout = () => {
    setPaymentMethod("paypal")
    setPaypalError(null)
  }

  const closeDialog = () => {
    if (paymentId && !paymentSuccess) {
      paymentService.cancelPayment(paymentId).catch(() => null)
    }
    if (paypalOrderId && !paymentSuccess) {
      paymentService.cancelPayPalOrder(paypalOrderId).catch(() => null)
    }
    setDialogOpen(false)
    setSelectedPlan(null)
    setClientSecret(null)
    setPaymentId(null)
    setIntentError(null)
    setPaypalError(null)
    setPaypalOrderId(null)
    setPaymentSuccess(false)
    setPaymentMethod(null)
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      <h2 className="text-center text-xl font-semibold uppercase tracking-wide text-muted-foreground">
        Plans
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className="flex flex-col border border-primary/10 bg-card/80 backdrop-blur @container/plan"
          >
            <CardHeader>
              <div className="flex items-baseline justify-between gap-2">
                <CardTitle
                  className={`text-xl font-semibold ${
                    plan.color ? "" : planStyleMap[plan.id] ?? "text-foreground"
                  }`}
                  style={plan.color ? { color: plan.color } : undefined}
                >
                  {plan.name}
                </CardTitle>
                <span className="text-lg font-semibold text-primary">
                  {formatPlanPrice(plan.amount, plan.currency)}
                </span>
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 text-sm">
              {(plan.features ?? []).map((feature) => (
                <div key={feature} className="text-muted-foreground">
                  {feature}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                variant="default"
                onClick={() => openCheckout(plan)}
                disabled={!stripePromise && !paypalKey?.clientId}
              >
                Buy
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
        modal={false}
      >
        <DialogContent className="border border-white/10 bg-black/60 text-white backdrop-blur-md md:left-[calc(50%+8rem)]">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? `${selectedPlan.name} plan` : "Plan checkout"}
            </DialogTitle>
            <DialogDescription>
              Complete payment to activate your plan.
            </DialogDescription>
          </DialogHeader>
          {!paymentMethod && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Choose your payment method to continue.
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  variant="outline"
                  onClick={startStripeCheckout}
                  disabled={!stripePromise}
                  className="gap-2"
                >
                  <CreditCard className="size-4" />
                  <span>Credit card</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={startPayPalCheckout}
                  disabled={!paypalKey?.clientId}
                  className="gap-2"
                >
                  <FaPaypal className="size-4" />
                  <span>PayPal</span>
                </Button>
              </div>
            </div>
          )}
          {paymentMethod === "stripe" && intentLoading && (
            <div className="text-sm text-muted-foreground">
              Preparing secure payment...
            </div>
          )}
          {paymentMethod === "stripe" && intentError && (
            <div className="text-sm text-destructive">{intentError}</div>
          )}
          {paymentSuccess ? (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Payment completed. Your plan is now active.
            </div>
          ) : paymentMethod === "stripe" ? (
            clientSecret &&
            stripePromise && (
              <Elements stripe={stripePromise}>
                <PlanPaymentForm
                  clientSecret={clientSecret}
                  onSuccess={() => setPaymentSuccess(true)}
                />
              </Elements>
            )
          ) : paymentMethod === "paypal" ? (
            paypalKey?.clientId && selectedPlan ? (
              <div className="space-y-3">
                {paypalError && (
                  <div className="text-sm text-destructive">{paypalError}</div>
                )}
                <PayPalScriptProvider
                  options={{
                    clientId: paypalKey.clientId,
                    currency: selectedPlan.currency,
                    intent: "capture",
                  }}
                >
                  <PayPalButtons
                    style={{ layout: "vertical", color: "gold" }}
                    createOrder={async () => {
                      try {
                        const response = await paymentService.createPayPalOrder(
                          selectedPlan.id
                        )
                        setPaypalOrderId(response.orderId)
                        return response.orderId
                      } catch {
                        setPaypalError("Unable to start PayPal checkout.")
                        throw new Error("PayPal order failed")
                      }
                    }}
                    onApprove={async (data) => {
                      try {
                        if (!data.orderID) {
                          throw new Error("Missing PayPal order")
                        }
                        await paymentService.capturePayPalOrder(data.orderID)
                        setPaymentSuccess(true)
                      } catch {
                        setPaypalError("PayPal capture failed.")
                      }
                    }}
                    onCancel={(data) => {
                      if (data.orderID) {
                        paymentService
                          .cancelPayPalOrder(data.orderID)
                          .catch(() => null)
                      }
                    }}
                    onError={() => {
                      setPaypalError("PayPal checkout failed.")
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                PayPal is not configured.
              </div>
            )
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
