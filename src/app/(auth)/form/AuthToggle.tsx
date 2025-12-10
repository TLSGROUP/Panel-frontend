import { PUBLIC_PAGES } from '@/config/pages/public.config'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/context/LanguageContext'

export function AuthToggle({ isLogin }: { isLogin: boolean }) {
	const router = useRouter()
	const { t } = useLanguage()

	return (
		<div className="text-center text-base mt-3">
			{isLogin ? (
				<p>
					{t('toggleNoAccount')}{' '}
					<button
						type="button"
						className="text-rose-300 text-base"
						onClick={() => router.push(PUBLIC_PAGES.REGISTER)}
					>
						{t('toggleSignUp')}
					</button>
				</p>
			) : (
				<p>
					{t('toggleHasAccount')}{' '}
					<button
						type="button"
						className="text-emerald-300 text-base"
						onClick={() => router.push(PUBLIC_PAGES.LOGIN)}
					>
						{t('toggleSignIn')}
					</button>
				</p>
			)}
		</div>
	)
}
