'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { BACKEND_SOCIAL_AUTH_URL } from '@/constants'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { socialsList, type TSocials } from './social-list.data'
import { useLanguage } from '@/context/LanguageContext'
import languageService from '@/services/language.service'

const list = socialsList()

export function SocialMediaButtons() {
	const [loadingId, setLoadingId] = useState<TSocials | null>(null)
	const { language } = useLanguage()

	const handleRedirect = async (id: TSocials) => {
		setLoadingId(id)

		try {
			await languageService.setPreference(language)
		} catch (error) {
			console.error('Failed to persist language preference', error)
		}

		window.location.href = `${BACKEND_SOCIAL_AUTH_URL}/${id}`
	}

	return (
		<>
			<div className="grid grid-cols-1 gap-3">
				{list.map(({ id, icon, name }) => (
					<button
						key={id}
						onClick={() => void handleRedirect(id)}
						disabled={loadingId === id}
						className={twMerge(
							'flex items-center justify-center p-2 border border-gray-300 rounded-md shadow-sm font-medium text-gray-700 hover:text-gray-900 bg-white hover:bg-gray-50 transition hover:scale-105 hover:shadow-lg will-change-transform',
							loadingId === id && 'bg-white/80 cursor-not-allowed'
						)}
						type="button"
					>
						{loadingId === id ? (
							<MiniLoader
								width={20}
								height={20}
								isDark
							/>
						) : (
							<div className="flex items-center gap-2">
								{icon}
								<span>{name}</span>
							</div>
						)}
					</button>
				))}
			</div>
		</>
	)
}
