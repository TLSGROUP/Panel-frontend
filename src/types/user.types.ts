import { UserRole } from './auth.types'
import type { Language } from '@/i18n/config'

// DTO пользователя, с которым работает фронтенд
export interface IUser {
	id: number
	name?: string
	lastName?: string
	email: string
	avatarPath?: string
	country?: string
	city?: string
	phone?: string
	referralCode?: string
	referralLink?: string
	referrerId?: string
	verificationToken?: string
	activePlanId?: string
	activePlanName?: string
	activePlanPrice?: number
	activePlanCurrency?: string
	activePlanPurchasedAt?: string
	rights: UserRole[]
	language: Language
}
