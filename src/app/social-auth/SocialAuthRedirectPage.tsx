'use client'

import { PUBLIC_PAGES } from '@/config/pages/public.config'

import { AuthToken } from '@/types/auth.types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { MiniLoader } from '@/components/ui/MiniLoader'
import authTokenService from '@/services/auth/auth-token.service'
import SocialEmailForm from './SocialEmailForm'

export function SocialAuthRedirectPage() {
	const searchParams = useSearchParams()
	const needEmail = searchParams.get('needEmail')

	const router = useRouter()

	useEffect(() => {
		const accessToken = searchParams.get(AuthToken.ACCESS_TOKEN)
		if (accessToken) authTokenService.saveAccessToken(accessToken)

		if (!needEmail) router.replace(PUBLIC_PAGES.HOME)
	}, [])

	if (needEmail) {
		return <SocialEmailForm />
	}

	return (
		<div className="flex items-center justify-center h-screen">
			<MiniLoader
				width={150}
				height={150}
			/>
		</div>
	)
}
