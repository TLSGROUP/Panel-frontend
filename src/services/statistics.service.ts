import { instance } from '@/api/axios'

export interface IUserRegistrationsByMonth {
	month: string
	year: number
	count: number
}

export interface ICountryCount {
	country: string
	count: number
}

export interface DashboardSummary {
	totalRevenue: number
	netRevenue: number
	currency: string
	newPartners: number
	totalPartners: number
	growthRate: number
	activePartners: number
	conversionRate: number
	avgRevenuePerPartner: number
	topLineGrowth7d: number
	topLineGrowth30d: number
	payoutRatio: number
}

class StatisticsService {
	private base = '/statistics'

	async getRegistrationsByMonth() {
		return instance.get<IUserRegistrationsByMonth[]>(
			`${this.base}/registrations-by-month`
		)
	}

	async getNumbers() {
		return instance.get<{ name: string; value: string }[]>(
			`${this.base}/numbers`
		)
	}

	async getCountByCountry() {
		return instance.get<ICountryCount[]>(`${this.base}/count-by-country`)
	}

	async getDashboardSummary() {
		return instance.get<DashboardSummary>(`${this.base}/summary`)
	}
}

export default new StatisticsService()
