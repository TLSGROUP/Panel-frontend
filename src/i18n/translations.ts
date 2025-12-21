import type { Language } from './config'

const translations = {
	en: {
		nameLabel: 'Name',
		namePlaceholder: 'Your name',
		emailLabel: 'Email',
		emailPlaceholder: 'Enter email',
		passwordLabel: 'Password',
		passwordPlaceholder: 'Enter password',
		referralCodeLabel: 'Referral code (optional)',
		referralCodePlaceholder: 'Enter referral code',
		forgotPassword: 'Forgot password?',
		submitLogin: 'Sign In',
		submitRegister: 'Sign Up',
		captchaError: 'Please complete the captcha',
		socialDivider: 'OR USE',
		toggleNoAccount: "Don't have an account?",
		toggleSignUp: 'Sign up',
		toggleHasAccount: 'Already have an account?',
		toggleSignIn: 'Sign In',
		languagePickerLabel: 'Language',
		hidePassword: 'Hide password',
		showPassword: 'Show password',
		passwordRecoveryIntro:
			'Enter the email you used to register. We’ll send a code to help you reset your password.',
		passwordRecoveryEmailLabel: 'Email',
		passwordRecoveryEmailPlaceholder: 'Enter email',
		passwordRecoveryEmailRequired: 'Email is required',
		passwordRecoverySendCode: 'Send verification code',
		passwordRecoveryCodeIntro: "We've sent a PIN to",
		passwordRecoveryCodeIntroSuffix:
			'. Check your inbox (and spam) and enter it below.',
		passwordRecoveryCodeLabel: 'Verification code',
		passwordRecoveryCodePlaceholder: 'Enter 6-digit code',
		passwordRecoveryCodeRequired: 'Code is required',
		passwordRecoveryVerifyButton: 'Verify code',
		passwordRecoveryPasswordIntro: 'Code confirmed for',
		passwordRecoveryPasswordIntroSuffix: '. Create a new password below.',
		passwordRecoveryNewPasswordLabel: 'New password',
		passwordRecoveryNewPasswordPlaceholder: 'Enter new password',
		passwordRecoveryNewPasswordRequired: 'Password is required',
		passwordRecoveryPasswordMinLength: 'Minimum 6 characters',
		passwordRecoveryConfirmPasswordLabel: 'Confirm password',
		passwordRecoveryConfirmPasswordPlaceholder: 'Repeat password',
		passwordRecoveryConfirmPasswordRequired: 'Please repeat the password',
		passwordRecoveryUpdatePasswordButton: 'Update password',
		passwordRecoveryBackToLogin: 'Back to sign in',
		passwordRecoveryToastGenericError: 'Something went wrong',
		passwordRecoveryToastCodeSent: 'We sent a verification code to your email',
		passwordRecoveryToastCodeConfirmed: 'Code confirmed. Set a new password.',
		passwordRecoveryToastPasswordUpdated:
			'Password updated. You can sign in now.',
		passwordRecoveryToastEmailMissing: 'Please submit your email first.',
		passwordRecoveryToastVerificationRequired:
			'Verification is required before updating password.',
		passwordRecoveryToastPasswordsMismatch: 'Passwords do not match'
	},
	de: {
		nameLabel: 'Name',
		namePlaceholder: 'Dein Name',
		emailLabel: 'E-Mail',
		emailPlaceholder: 'E-Mail eingeben',
		passwordLabel: 'Passwort',
		passwordPlaceholder: 'Passwort eingeben',
		referralCodeLabel: 'Empfehlungscode (optional)',
		referralCodePlaceholder: 'Empfehlungscode eingeben',
		forgotPassword: 'Passwort vergessen?',
		submitLogin: 'Anmelden',
		submitRegister: 'Registrieren',
		captchaError: 'Bitte schließe das Captcha ab',
		socialDivider: 'ODER',
		toggleNoAccount: 'Noch kein Konto?',
		toggleSignUp: 'Registrieren',
		toggleHasAccount: 'Bereits registriert?',
		toggleSignIn: 'Anmelden',
		languagePickerLabel: 'Sprache',
		hidePassword: 'Passwort verbergen',
		showPassword: 'Passwort anzeigen',
		passwordRecoveryIntro:
			'Gib die E-Mail ein, mit der du dich registriert hast. Wir senden dir einen Code, um dein Passwort zurückzusetzen.',
		passwordRecoveryEmailLabel: 'E-Mail',
		passwordRecoveryEmailPlaceholder: 'E-Mail eingeben',
		passwordRecoveryEmailRequired: 'E-Mail ist erforderlich',
		passwordRecoverySendCode: 'Bestätigungscode senden',
		passwordRecoveryCodeIntro: 'Wir haben eine PIN an',
		passwordRecoveryCodeIntroSuffix:
			'gesendet. Überprüfe dein Postfach (und den Spam-Ordner) und gib den Code unten ein.',
		passwordRecoveryCodeLabel: 'Bestätigungscode',
		passwordRecoveryCodePlaceholder: '6-stelligen Code eingeben',
		passwordRecoveryCodeRequired: 'Code ist erforderlich',
		passwordRecoveryVerifyButton: 'Code bestätigen',
		passwordRecoveryPasswordIntro: 'Code bestätigt für',
		passwordRecoveryPasswordIntroSuffix: 'Erstelle unten ein neues Passwort.',
		passwordRecoveryNewPasswordLabel: 'Neues Passwort',
		passwordRecoveryNewPasswordPlaceholder: 'Neues Passwort eingeben',
		passwordRecoveryNewPasswordRequired: 'Passwort ist erforderlich',
		passwordRecoveryPasswordMinLength: 'Mindestens 6 Zeichen',
		passwordRecoveryConfirmPasswordLabel: 'Passwort bestätigen',
		passwordRecoveryConfirmPasswordPlaceholder: 'Passwort wiederholen',
		passwordRecoveryConfirmPasswordRequired: 'Passwort bitte wiederholen',
		passwordRecoveryUpdatePasswordButton: 'Passwort aktualisieren',
		passwordRecoveryBackToLogin: 'Zur Anmeldung zurückkehren',
		passwordRecoveryToastGenericError: 'Etwas ist schiefgelaufen',
		passwordRecoveryToastCodeSent:
			'Wir haben dir einen Bestätigungscode gesendet.',
		passwordRecoveryToastCodeConfirmed: 'Code bestätigt. Neues Passwort setzen.',
		passwordRecoveryToastPasswordUpdated:
			'Passwort aktualisiert. Du kannst dich jetzt anmelden.',
		passwordRecoveryToastEmailMissing:
			'Bitte gib zuerst deine E-Mail-Adresse an.',
		passwordRecoveryToastVerificationRequired:
			'Vor dem Aktualisieren ist eine Bestätigung erforderlich.',
		passwordRecoveryToastPasswordsMismatch:
			'Passwörter stimmen nicht überein.'
	}
} satisfies Record<Language, Record<string, string>>

export type TranslationKey = keyof typeof translations.en

export default translations
