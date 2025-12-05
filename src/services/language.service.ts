import { axiosClassic } from '@/api/axios'
import type { Language } from '@/i18n/config'

class LanguageService {
	async setPreference(language: Language) {
		return axiosClassic.post('/auth/language', { language })
	}
}

export default new LanguageService()
