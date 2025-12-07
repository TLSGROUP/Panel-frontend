import { UserRole } from './auth.types'
import type { Language } from '@/i18n/config'

// DTO пользователя, с которым работает фронтенд
export interface IUser {
	id: number
	name?: string
	email: string
	avatarPath?: string
	country?: string
	verificationToken?: string
	rights: UserRole[]
	language: Language
}
