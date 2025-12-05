'use client'

import { FiGlobe } from 'react-icons/fi'

import { useLanguage } from '@/context/LanguageContext'
import {
	SUPPORTED_LANGUAGES,
	languageLabels,
	type Language
} from '@/i18n/config'

export function LanguagePicker() {
	const { language, setLanguage, t } = useLanguage()

	return (
		<div className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm rounded-md shadow px-3 py-2">
			<label
				className="flex items-center gap-2 text-sm text-gray-700"
				htmlFor="language-picker"
			>
				<span className="sr-only">{t('languagePickerLabel')}</span>
				<FiGlobe
					aria-hidden
					className="text-gray-600"
				/>
				<select
					id="language-picker"
					value={language}
					onChange={event => setLanguage(event.target.value as Language)}
					className="bg-transparent border border-gray-300 rounded px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary"
				>
					{SUPPORTED_LANGUAGES.map(lang => (
						<option
							value={lang}
							key={lang}
						>
							{languageLabels[lang]}
						</option>
					))}
				</select>
			</label>
		</div>
	)
}
