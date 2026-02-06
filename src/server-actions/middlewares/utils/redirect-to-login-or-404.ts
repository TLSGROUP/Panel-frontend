import { PUBLIC_PAGES } from '@/config/pages/public.config'
import { AuthToken } from '@/types/auth.types'
import { NextRequest } from 'next/server'
import { nextRedirect } from './next-redirect'

export const redirectToLoginOrNotFound = (request: NextRequest) => {
	const response = nextRedirect(PUBLIC_PAGES.LOGIN, request.url)
	const configuredDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN
	const domain =
		configuredDomain && configuredDomain !== 'localhost'
			? configuredDomain
			: undefined

	response.cookies.set({
		name: AuthToken.ACCESS_TOKEN,
		value: '',
		path: '/',
		expires: new Date(0),
		domain
	})

	return response
}
