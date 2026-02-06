import { AuthToken } from '@/types/auth.types'
import Cookies from 'js-cookie'

class AuthTokenService {
	// Тянем accessToken из cookies (или null, если нет)
	getAccessToken() {
		const accessToken = Cookies.get(AuthToken.ACCESS_TOKEN)
		return accessToken || null
	}

	// Сохраняем accessToken в cookie на сутки
	saveAccessToken(accessToken: string) {
		const isProd = process.env.NODE_ENV === 'production'
		const configuredDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
		const domain =
			configuredDomain && configuredDomain !== 'localhost'
				? configuredDomain
				: undefined
		const secure =
			typeof process.env.NEXT_PUBLIC_COOKIE_SECURE === 'string'
				? process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true'
				: isProd
		const sameSite =
			(process.env.NEXT_PUBLIC_COOKIE_SAMESITE as
				| 'lax'
				| 'strict'
				| 'none') || (isProd ? 'lax' : 'lax')
		const effectiveSecure = sameSite === 'none' ? true : secure

		Cookies.set(AuthToken.ACCESS_TOKEN, accessToken, {
			domain,
			sameSite,
			secure: effectiveSecure,
			expires: 1
		})
	}

	// Удаляем cookie accessToken
	removeAccessToken() {
		const isProd = process.env.NODE_ENV === 'production'
		const configuredDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
		const domain =
			configuredDomain && configuredDomain !== 'localhost'
				? configuredDomain
				: undefined
		const secure =
			typeof process.env.NEXT_PUBLIC_COOKIE_SECURE === 'string'
				? process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true'
				: isProd
		const sameSite =
			(process.env.NEXT_PUBLIC_COOKIE_SAMESITE as
				| 'lax'
				| 'strict'
				| 'none') || (isProd ? 'lax' : 'lax')
		const effectiveSecure = sameSite === 'none' ? true : secure

		Cookies.remove(AuthToken.ACCESS_TOKEN, {
			domain,
			sameSite,
			secure: effectiveSecure
		})
	}
}

export default new AuthTokenService()
