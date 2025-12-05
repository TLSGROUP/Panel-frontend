export const SUPPORTED_LANGUAGES = ['en', 'de'] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'en'

export const languageLabels: Record<Language, string> = {
	en: 'English',
	de: 'Deutsch'
}
