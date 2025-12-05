'use client'

import {
	createContext,
	type PropsWithChildren,
	useCallback,
	useContext,
	useEffect,
	useState
} from 'react'
import {
	DEFAULT_LANGUAGE,
	SUPPORTED_LANGUAGES,
	type Language
} from '@/i18n/config'
import translations, { type TranslationKey } from '@/i18n/translations'
import languageService from '@/services/language.service'

const STORAGE_KEY = 'preferredLanguage'

interface LanguageContextValue {
	language: Language
	setLanguage: (language: Language) => void
	t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

const isSupportedLanguage = (value: string): value is Language =>
	SUPPORTED_LANGUAGES.includes(value as Language)

export function LanguageProvider({ children }: PropsWithChildren) {
	const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE)

	useEffect(() => {
		if (typeof window === 'undefined') return
		const stored = window.localStorage.getItem(STORAGE_KEY)
		if (stored && isSupportedLanguage(stored)) {
			setLanguageState(stored)
		}
	}, [])

	useEffect(() => {
		if (typeof window === 'undefined') return
		languageService.setPreference(language).catch(() => {
			// swallow errors silently; preference persistence failure shouldn't block UI
		})
	}, [language])

	const changeLanguage = useCallback((nextLanguage: Language) => {
		setLanguageState(nextLanguage)
		if (typeof window !== 'undefined') {
			window.localStorage.setItem(STORAGE_KEY, nextLanguage)
		}
	}, [])

	const translate = useCallback(
		(key: TranslationKey) =>
			translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE][key],
		[language]
	)

	return (
		<LanguageContext.Provider
			value={{ language, setLanguage: changeLanguage, t: translate }}
		>
			{children}
		</LanguageContext.Provider>
	)
}

export function useLanguage() {
	const context = useContext(LanguageContext)

	if (!context) {
		throw new Error('useLanguage must be used within a LanguageProvider')
	}

	return context
}
