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
}

export default new PaymentService()
