import { axiosClassic } from '@/api/axios'
import {
	IFormData,
	IPasswordResetPayload,
	IPasswordResetRequest,
	IPasswordResetVerify
} from '@/types/auth.types'
import { IUser } from '@/types/user.types'
import authTokenService from './auth-token.service'

interface IAuthResponse {
	user: IUser
	accessToken: string
}

class AuthService {
	// Универсальный метод для логина/регистрации
	async main(
		type: 'login' | 'register',
		data: IFormData,
		recaptchaToken?: string | null
	) {
		const response = await axiosClassic.post<IAuthResponse>(
			`/auth/${type}`,
			data,
			{
				headers: {
					recaptcha: recaptchaToken
				}
			}
		)

		if (response.data.accessToken) {
			authTokenService.saveAccessToken(response.data.accessToken)
		}

		return response
	}

	// Получаем новую пару токенов через refresh
	async getNewTokens() {
		const response = await axiosClassic.post<IAuthResponse>(
			'/auth/access-token'
		)

		if (response.data.accessToken)
			authTokenService.saveAccessToken(response.data.accessToken)

		return response
	}

	// Выходим из аккаунта и чистим токен
	async logout() {
		const response = await axiosClassic.post<boolean>('/auth/logout')

		if (response.data) authTokenService.removeAccessToken()

		return response
	}

	// Запрашиваем/верифицируем/применяем сброс пароля
	async requestPasswordReset(dto: IPasswordResetRequest) {
		return axiosClassic.post('/auth/password/forgot', dto)
	}

	async verifyResetCode(dto: IPasswordResetVerify) {
		return axiosClassic.post('/auth/password/verify', dto)
	}

	async resetPassword(dto: IPasswordResetPayload) {
		return axiosClassic.post('/auth/password/reset', dto)
	}
}

export default new AuthService()
