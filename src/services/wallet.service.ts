import { instance } from "@/api/axios"

export type WalletSummary = {
  balance: number
  currency: string | null
}

export type WalletTransaction = {
  id: string
  type: "CREDIT" | "DEBIT"
  amount: number
  currency: string
  createdAt: string
  paymentId?: string | null
  payout?: {
    level: number
    percent: number
    planId: string
    sourceUser: {
      id: string
      name: string | null
      lastName: string | null
      email: string | null
    }
  } | null
}

class WalletService {
  async fetchWallet() {
    const response = await instance.get<WalletSummary>("/wallet")
    return response.data
  }

  async fetchTransactions(limit = 20) {
    const response = await instance.get<WalletTransaction[]>(
      `/wallet/transactions?limit=${limit}`
    )
    return response.data
  }
}

export default new WalletService()
