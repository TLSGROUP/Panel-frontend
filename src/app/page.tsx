import { PUBLIC_PAGES } from '@/config/pages/public.config'
import { getNewTokensByRefresh } from '@/server-actions/middlewares/utils/get-new-tokens-by-refresh'
import { jwtVerifyServer } from '@/server-actions/middlewares/utils/jwt-verify'
import { AuthToken } from '@/types/auth.types'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardPage from './dashboard/page'

export default async function Home() {
	const cookieStore = await cookies()
	const refreshToken = cookieStore.get(AuthToken.REFRESH_TOKEN)?.value
	let accessToken = cookieStore.get(AuthToken.ACCESS_TOKEN)?.value

	const verifyUser = async (token?: string | null) => {
		if (!token) return null
		return await jwtVerifyServer(token)
	}

	let user = await verifyUser(accessToken)

	if (!user && refreshToken) {
		try {
			const tokens = await getNewTokensByRefresh(refreshToken)
			accessToken = tokens.accessToken
			user = await verifyUser(accessToken)
		} catch {
			// ignore, user stays unauthenticated
		}
	}

	if (user?.isLoggedIn) {
		return <DashboardPage />
	}

	redirect(PUBLIC_PAGES.LOGIN)
}
