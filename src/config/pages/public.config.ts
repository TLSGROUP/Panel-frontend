class PublicPages {
	HOME = '/'

	AUTH = '/auth'
	LOGIN = `${this.AUTH}/login`
	REGISTER = `${this.AUTH}/register`
	FORGOT_PASSWORD = `${this.AUTH}/forgot-password`

	PLANS = '/plans'
}

export const PUBLIC_PAGES = new PublicPages()
