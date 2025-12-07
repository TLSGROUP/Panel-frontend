import { IUser } from './user.types'
import type { Language } from '@/i18n/config'

// Названия cookie/param для access/refresh токенов
export const AuthToken = {
	ACCESS_TOKEN: 'accessToken',
	REFRESH_TOKEN: 'refreshToken'
} as const

export type AuthToken = (typeof AuthToken)[keyof typeof AuthToken]

// Роли пользователя
export const UserRole = {
	USER: 'USER',
	MANAGER: 'MANAGER',
	ADMIN: 'ADMIN'
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

// Payload, который возвращает JWT
export interface ITokenInside {
	id: number
	rights: UserRole[]
	iat: number
	exp: number
}

export type TProtectUserData = Omit<ITokenInside, 'iat' | 'exp'>

// Данные для форм логина/регистрации
export interface IFormData extends Pick<IUser, 'email' | 'name'> {
	password: string
	language?: Language
}

// DTO для сброса пароля
export interface IPasswordResetRequest {
	email: string
}

export interface IPasswordResetVerify extends IPasswordResetRequest {
	code: string
}

export interface IPasswordResetPayload extends IPasswordResetVerify {
	password: string
}
