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
		Cookies.set(AuthToken.ACCESS_TOKEN, accessToken, {
			domain: 'localhost',
			sameSite: 'strict',
			expires: 1
		})
	}

	// Удаляем cookie accessToken
	removeAccessToken() {
		Cookies.remove(AuthToken.ACCESS_TOKEN)
	}
}

export default new AuthTokenService()
