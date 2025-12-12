import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_PAGES } from './config/pages/admin.config'
import { DASHBOARD_PAGES } from './config/pages/dashboard.config'
import { PUBLIC_PAGES } from './config/pages/public.config'
import { protectAdminPages } from './server-actions/middlewares/protect-admin.middleware'
import { protectDashboardPages } from './server-actions/middlewares/protect-dashboard.middleware'
import { protectLoginPages } from './server-actions/middlewares/protect-login.middleware'

// Роутер-мидлвар для защиты auth/admin/dashboard путей
export async function proxy(request: NextRequest): Promise<NextResponse> {
	const pathname = request.nextUrl.pathname

	const authPages = [
		PUBLIC_PAGES.LOGIN,
		PUBLIC_PAGES.REGISTER,
		PUBLIC_PAGES.FORGOT_PASSWORD
	]

	if (authPages.some(page => pathname.startsWith(page))) {
		return protectLoginPages(request)
	}

	if (
		pathname.startsWith(ADMIN_PAGES.HOME) ||
		pathname.startsWith(ADMIN_PAGES.MANAGER)
	) {
		return protectAdminPages(request)
	}

	if (pathname.startsWith(DASHBOARD_PAGES.HOME)) {
		return protectDashboardPages(request)
	}

	return NextResponse.next()
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/auth/:path*',
		'/admin/:path*',
		'/manager/:path*'
	]
}
