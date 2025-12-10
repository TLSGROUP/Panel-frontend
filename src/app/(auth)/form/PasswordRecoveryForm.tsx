'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { useLanguage } from '@/context/LanguageContext'
import styles from '../form/AuthForm.module.scss'
import { usePasswordRecovery } from './usePasswordRecovery'

export function PasswordRecoveryForm() {
	const {
		stage,
		emailForm,
		codeForm,
		passwordForm,
		handleRequestCode,
		handleVerifyCode,
		handleResetPassword,
		isRequestingCode,
		isVerifyingCode,
		isResettingPassword,
		submittedEmail,
		goToLogin
	} = usePasswordRecovery()

	const {
		register: registerEmail,
		formState: { errors: emailErrors }
	} = emailForm
	const {
		register: registerCode,
		formState: { errors: codeErrors }
	} = codeForm
	const {
		register: registerPassword,
		formState: { errors: passwordErrors }
	} = passwordForm
	const { t } = useLanguage()

	return (
		<div className="max-w-sm w-[320px] space-y-6">
			<p className="text-sm text-gray-400">
				{t('passwordRecoveryIntro')}
			</p>

			{stage === 'email' && (
				<form
					onSubmit={handleRequestCode}
					className="space-y-3"
				>
					<label className="text-gray-300 block">
						{t('passwordRecoveryEmailLabel')}
						<input
							type="email"
							placeholder={t('passwordRecoveryEmailPlaceholder')}
							{...registerEmail('email', {
								required: t('passwordRecoveryEmailRequired')
							})}
							className={styles['input-field']}
						/>
					</label>
					{emailErrors.email && (
						<p className="text-xs text-rose-300">{emailErrors.email.message}</p>
					)}

					<button
						type="submit"
						className={`${styles['btn-primary']} bg-primary`}
						disabled={isRequestingCode}
					>
						{isRequestingCode ? (
							<MiniLoader />
						) : (
							t('passwordRecoverySendCode')
						)}
					</button>
				</form>
			)}

			{stage === 'code' && (
				<form
					onSubmit={handleVerifyCode}
					className="space-y-3"
				>
					<p className="text-xs text-gray-400">
						{t('passwordRecoveryCodeIntro')}{' '}
						<span className="text-white">{submittedEmail}</span>
						{t('passwordRecoveryCodeIntroSuffix')}
					</p>
					<label className="text-gray-300 block">
						{t('passwordRecoveryCodeLabel')}
						<input
							type="text"
							inputMode="numeric"
							maxLength={6}
							placeholder={t('passwordRecoveryCodePlaceholder')}
							{...registerCode('code', {
								required: t('passwordRecoveryCodeRequired')
							})}
							className={styles['input-field']}
						/>
					</label>
					{codeErrors.code && (
						<p className="text-xs text-rose-300">{codeErrors.code.message}</p>
					)}
					<button
						type="submit"
						className={`${styles['btn-primary']} bg-primary`}
						disabled={isVerifyingCode}
					>
						{isVerifyingCode ? <MiniLoader /> : t('passwordRecoveryVerifyButton')}
					</button>
				</form>
			)}

			{stage === 'password' && (
				<form
					onSubmit={handleResetPassword}
					className="space-y-3"
				>
					<p className="text-xs text-gray-400">
						{t('passwordRecoveryPasswordIntro')}{' '}
						<span className="text-white">{submittedEmail}</span>
						{t('passwordRecoveryPasswordIntroSuffix')}
					</p>
					<label className="text-gray-300 block">
						{t('passwordRecoveryNewPasswordLabel')}
						<input
							type="password"
							placeholder={t('passwordRecoveryNewPasswordPlaceholder')}
							{...registerPassword('password', {
								required: t('passwordRecoveryNewPasswordRequired'),
								minLength: {
									value: 6,
									message: t('passwordRecoveryPasswordMinLength')
								}
							})}
							className={styles['input-field']}
						/>
					</label>
					{passwordErrors.password && (
						<p className="text-xs text-rose-300">
							{passwordErrors.password.message}
						</p>
					)}

					<label className="text-gray-300 block">
						{t('passwordRecoveryConfirmPasswordLabel')}
						<input
							type="password"
							placeholder={t('passwordRecoveryConfirmPasswordPlaceholder')}
							{...registerPassword('confirmPassword', {
								required: t('passwordRecoveryConfirmPasswordRequired')
							})}
							className={styles['input-field']}
						/>
					</label>
					{passwordErrors.confirmPassword && (
						<p className="text-xs text-rose-300">
							{passwordErrors.confirmPassword.message}
						</p>
					)}

					<button
						type="submit"
						className={`${styles['btn-primary']} bg-primary`}
						disabled={isResettingPassword}
					>
						{isResettingPassword ? (
							<MiniLoader />
						) : (
							t('passwordRecoveryUpdatePasswordButton')
						)}
					</button>
				</form>
			)}

			<button
				type="button"
				className="w-full text-sm text-sky-300 hover:text-sky-200 transition"
				onClick={goToLogin}
			>
				{t('passwordRecoveryBackToLogin')}
			</button>
		</div>
	)
}
