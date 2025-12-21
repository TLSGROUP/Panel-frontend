import { instance } from "@/api/axios"

export type PlanCatalogItem = {
  id: string
  name: string
  amount: number
  currency: string
  description?: string
  features?: string[]
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
}

export default new PaymentService()
