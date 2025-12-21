'use server'

import { type NextRequest, NextResponse } from 'next/server'

import { ADMIN_PAGES } from '@/config/pages/admin.config'
import { getTokensFromRequest } from './utils/get-tokens-from-request'
import { jwtVerifyServer } from './utils/jwt-verify'
import { nextRedirect } from './utils/next-redirect'
import { redirectToLoginOrNotFound } from './utils/redirect-to-login-or-404'

// Middleware для защиты приватных dashboard страниц
export async function protectDashboardPages(request: NextRequest) {
	const tokens = await getTokensFromRequest(request)
	if (!tokens) return redirectToLoginOrNotFound(request)

	const verifiedData = await jwtVerifyServer(tokens.accessToken)
	if (!verifiedData) return redirectToLoginOrNotFound(request)

	if (verifiedData.isAdmin) {
		return nextRedirect(ADMIN_PAGES.HOME, request.url)
	}

	if (verifiedData.isManager) {
		return nextRedirect(ADMIN_PAGES.MANAGER, request.url)
	}

	return NextResponse.next()
}
