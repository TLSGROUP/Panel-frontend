import { API_URL } from '@/constants'
import authTokenService from '@/services/auth/auth-token.service'
import authService from '@/services/auth/auth.service'
import axios, { CreateAxiosDefaults } from 'axios'
import { errorCatch, getContentType } from './api.helper'

// Базовая конфигурация для всех HTTP инстансов
const axiosOptions: CreateAxiosDefaults = {
	baseURL: API_URL,
	headers: getContentType(),
	withCredentials: true
}

// Запросы без авторизации/интерцепторов
export const axiosClassic = axios.create(axiosOptions)

// Основной инстанс с JWT-интерцепторами
export const instance = axios.create(axiosOptions)

// Подставляем accessToken в каждый запрос
instance.interceptors.request.use(config => {
	const accessToken = authTokenService.getAccessToken()

	if (config?.headers && accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`
	}

	return config
})

instance.interceptors.response.use(
	config => config,
	async error => {
		const originalRequest = error.config

		// Когда токен протух — пытаемся обновить и повторить запрос
		if (
			(error.response.status === 401 ||
				errorCatch(error) === 'jwt expired' ||
				errorCatch(error) === 'jwt must be provided') &&
			error.config &&
			!error.config._isRetry
		) {
			originalRequest._isRetry = true

			try {
				await authService.getNewTokens()
				return instance.request(originalRequest)
			} catch (error) {
				if (
					errorCatch(error) === 'jwt expired' ||
					errorCatch(error) === 'Refresh token not passed'
				) {
					authTokenService.removeAccessToken()
				}
			}
		}

		throw error
	}
)
