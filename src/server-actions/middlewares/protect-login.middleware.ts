'use server'

import { type NextRequest, NextResponse } from 'next/server'

import { ADMIN_PAGES } from '@/config/pages/admin.config'
import { DASHBOARD_PAGES } from '@/config/pages/dashboard.config'
import { getTokensFromRequest } from './utils/get-tokens-from-request'
import { jwtVerifyServer } from './utils/jwt-verify'
import { nextRedirect } from './utils/next-redirect'

// Не даём авторизованным пользователям видеть login/register
export async function protectLoginPages(request: NextRequest) {
	const tokens = await getTokensFromRequest(request)
	if (!tokens) return NextResponse.next()

	const verifiedData = await jwtVerifyServer(tokens.accessToken)
	if (!verifiedData) return NextResponse.next()

	if (verifiedData.isAdmin) {
		return nextRedirect(ADMIN_PAGES.HOME, request.url)
	}

	if (verifiedData.isManager) {
		return nextRedirect(ADMIN_PAGES.MANAGER, request.url)
	}

	return nextRedirect(DASHBOARD_PAGES.PROFILE, request.url)
}
