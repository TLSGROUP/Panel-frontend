import { Suspense } from 'react'
import { SocialAuthRedirectPage } from './SocialAuthRedirectPage'

export default function SocialAuthPage() {
	return (
		<Suspense>
			<SocialAuthRedirectPage />
		</Suspense>
	)
}
