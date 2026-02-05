import { instance } from "@/api/axios"

export type PlanCatalogItem = {
  id: string
  name: string
  amount: number
  currency: string
  description?: string
  features?: string[]
  color?: string
}

export type BillingHistoryItem = {
  id: string
  type: "Payment" | "Payout"
  amount: number
  currency: string
  plan: string
  status: string
  source: string
  createdAt: string
}

export type BillingHistoryResponse = {
  success: boolean
  data: BillingHistoryItem[]
  pagination: {
    page: number
    limit: number
    total_pages: number
    total_items: number
  }
}

export type BillingHistoryParams = {
  page?: number
  limit?: number
  search?: string
  from_date?: string
  to_date?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

class PaymentService {
  async fetchPlans() {
    const response = await instance.get<PlanCatalogItem[]>("/payments/plans")
    return response.data
  }

  async fetchPublicKey() {
    const response = await instance.get<{ publicKey: string }>("/payments/public-key")
    return response.data
  }

  async fetchPayPalClientId() {
    const response = await instance.get<{ clientId: string }>("/payments/paypal/client-id")
    return response.data
  }

  async createPaymentIntent(planId: string) {
    const response = await instance.post<{ clientSecret: string; paymentId: string }>("/payments/intent", {
      planId
    })
    return response.data
  }

  async cancelPayment(paymentId: string) {
    const response = await instance.post<{ status: string }>("/payments/cancel", {
      paymentId
    })
    return response.data
  }

  async createPayPalOrder(planId: string) {
    const response = await instance.post<{ orderId: string }>("/payments/paypal/order", {
      planId
    })
    return response.data
  }

  async capturePayPalOrder(orderId: string) {
    const response = await instance.post<{ status: string }>("/payments/paypal/capture", {
      orderId
    })
    return response.data
  }

  async cancelPayPalOrder(orderId: string) {
    const response = await instance.post<{ status: string }>("/payments/paypal/cancel", {
      orderId
    })
    return response.data
  }

  async confirmStripePayment(paymentId: string) {
    const response = await instance.post<{ status: string }>("/payments/stripe/confirm", {
      paymentId
    })
    return response.data
  }

  async fetchBillingHistory(params: BillingHistoryParams) {
    const response = await instance.get<BillingHistoryResponse>("/payments/history", {
      params,
    })
    return response.data
  }
}

export default new PaymentService()
