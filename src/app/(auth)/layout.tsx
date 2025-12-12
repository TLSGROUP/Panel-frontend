import { LanguagePicker } from '@/components/language/LanguagePicker'
import { PUBLIC_PAGES } from '@/config/pages/public.config'
import { AuthToken } from '@/types/auth.types'
import { jwtVerifyServer } from '@/server-actions/middlewares/utils/jwt-verify'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export default async function AuthLayout({ children }: PropsWithChildren) {
	const cookieStore = await cookies()
	const accessToken = cookieStore.get(AuthToken.ACCESS_TOKEN)?.value

	if (accessToken) {
		const user = await jwtVerifyServer(accessToken)

		if (user?.isLoggedIn) {
			return redirect(PUBLIC_PAGES.HOME)
		}
	}

	return (
		<>
			<LanguagePicker />
			{children}
		</>
	)
}
