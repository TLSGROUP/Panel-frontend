'use client'

import { MiniLoader } from '@/components/ui/MiniLoader'
import { PUBLIC_PAGES } from '@/config/pages/public.config'
import ReCAPTCHA from 'react-google-recaptcha'
import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import styles from './AuthForm.module.scss'
import { AuthToggle } from './AuthToggle'
import { SocialMediaButtons } from './socials/SocialMediaButtons'
import { useAuthForm } from './useAuthForm'
import { useLanguage } from '@/context/LanguageContext'

interface Props {
	isLogin: boolean
}

export function AuthForm({ isLogin }: Props) {
	const { handleSubmit, isLoading, onSubmit, recaptchaRef, register } =
		useAuthForm(isLogin)
	const [showPassword, setShowPassword] = useState(false)
	const { t } = useLanguage()

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="max-w-sm mx-auto"
		>
			{!isLogin && (
				<div className="mb-4">
					<label className="text-gray-600">
						{t('nameLabel')}
						<span className="text-red-500 ml-1">*</span>
						<input
							type="text"
							placeholder={t('namePlaceholder')}
							{...register('name', { required: !isLogin })}
							className={styles['input-field']}
						/>
					</label>
				</div>
			)}

			<div className="mb-4">
				<label className="text-gray-600">
					{t('emailLabel')}
					<span className="text-red-500 ml-1">*</span>
					<input
						type="email"
						placeholder={t('emailPlaceholder')}
						{...register('email', { required: true })}
						className={styles['input-field']}
					/>
				</label>
			</div>

			<div className="mb-6">
				<label className="text-gray-600 block">
					<div className="flex items-center justify-between text-sm text-gray-400">
						<span className="text-base text-gray-600">
							{t('passwordLabel')}
							<span className="text-red-500 ml-1">*</span>
						</span>
						{isLogin && (
							<Link
								href={PUBLIC_PAGES.FORGOT_PASSWORD}
								className="text-xs text-primary hover:text-primary/80 transition"
							>
								{t('forgotPassword')}
							</Link>
						)}
					</div>
					<div className="relative">
						<input
							type={showPassword ? 'text' : 'password'}
							placeholder={t('passwordPlaceholder')}
							{...register('password', { required: true })}
							className={styles['input-field']}
						/>
						<button
							type="button"
							className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition"
							onClick={() => setShowPassword(prev => !prev)}
							aria-label={
								showPassword ? t('hidePassword') : t('showPassword')
							}
						>
							{showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
						</button>
					</div>
				</label>
			</div>

			<ReCAPTCHA
				ref={recaptchaRef}
				size="normal"
				sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
				theme="light"
				className={styles['recaptcha']}
			/>

			<div className="mb-3">
				<button
					type="submit"
					className={twMerge(
						styles['btn-primary'],
						isLogin ? 'bg-primary' : 'bg-secondary',
						isLoading && 'opacity-75 cursor-not-allowed'
					)}
					disabled={isLoading}
				>
					{isLoading ? (
						<MiniLoader />
					) : isLogin ? (
						t('submitLogin')
					) : (
						t('submitRegister')
					)}
				</button>
			</div>

			<div className="my-4 flex items-center gap-3 text-xs font-semibold tracking-wide text-gray-500">
				<span className="flex-1 h-px bg-gray-200" />
				<span>{t('socialDivider')}</span>
				<span className="flex-1 h-px bg-gray-200" />
			</div>

			<SocialMediaButtons />

			<AuthToggle isLogin={isLogin} />
		</form>
	)
}
