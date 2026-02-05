import { instance } from "@/api/axios"

export type WithdrawalRequest = {
  id: string
  requestId: string
  userId: string
  name?: string
  lastName?: string
  email?: string
  amount: number
  currency: string
  method: string
  details?: string
  status: string
  txHash?: string | null
  receiptUrl?: string | null
  createdAt: string
}

export type WithdrawalsResponse = {
  success: boolean
  data: WithdrawalRequest[]
  pagination: {
    page: number
    limit: number
    total_pages: number
    total_items: number
  }
}

export type WithdrawalsParams = {
  page?: number
  limit?: number
  search?: string
  from_date?: string
  to_date?: string
  sort_by?: string
  sort_order?: "asc" | "desc"
}

export type CreateWithdrawalPayload = {
  amount: number
  method: "CREDIT_CARD" | "PAYPAL" | "USDT_TRC20"
}

export type UpdateWithdrawalPayload = {
  status: "PENDING" | "REJECTED" | "PAID"
  txHash?: string
  receiptUrl?: string
  rejectReason?: string
}

class WithdrawalService {
  async createRequest(payload: CreateWithdrawalPayload) {
    const response = await instance.post<WithdrawalRequest>("/withdrawals", payload)
    return response.data
  }

  async fetchRequests(params?: WithdrawalsParams) {
    const response = await instance.get<WithdrawalsResponse>("/withdrawals", {
      params,
    })
    return response.data
  }

  async fetchMyRequests(params?: WithdrawalsParams) {
    const response = await instance.get<WithdrawalsResponse>("/withdrawals/me", {
      params,
    })
    return response.data
  }

  async updateRequest(id: string, payload: UpdateWithdrawalPayload) {
    const response = await instance.patch<WithdrawalRequest>(
      `/withdrawals/${id}`,
      payload
    )
    return response.data
  }
}

export default new WithdrawalService()
