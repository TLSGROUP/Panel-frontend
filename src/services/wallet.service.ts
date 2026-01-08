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

export type WalletTransactionsPage = {
  items: WalletTransaction[]
  total: number
  page: number
  limit: number
}

class WalletService {
  async fetchWallet() {
    const response = await instance.get<WalletSummary>("/wallet")
    return response.data
  }

  async fetchTransactions(limit = 20, page = 1) {
    const response = await instance.get<WalletTransactionsPage>(
      `/wallet/transactions?limit=${limit}&page=${page}`
    )
    return response.data
  }
}

export default new WalletService()
