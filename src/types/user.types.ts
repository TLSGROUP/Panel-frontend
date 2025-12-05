import { UserRole } from './auth.types'
import type { Language } from '@/i18n/config'

export interface IUser {
	id: number
	name?: string
	email: string
	avatarPath?: string
	verificationToken?: string
	rights: UserRole[]
	language: Language
}
