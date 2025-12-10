import { PUBLIC_PAGES } from '@/config/pages/public.config'
import authService from '@/services/auth/auth.service'
import {
	IPasswordResetPayload,
	IPasswordResetRequest,
	IPasswordResetVerify
} from '@/types/auth.types'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

type Stage = 'email' | 'code' | 'password'

interface PasswordFormValues {
	password: string
	confirmPassword: string
}

export function usePasswordRecovery() {
	const router = useRouter()
	const { t } = useLanguage()
	const [stage, setStage] = useState<Stage>('email')
	const [submittedEmail, setSubmittedEmail] = useState('')
	const [verifiedCode, setVerifiedCode] = useState('')

	const emailForm = useForm<IPasswordResetRequest>({
		defaultValues: { email: '' }
	})
	const codeForm = useForm<Pick<IPasswordResetVerify, 'code'>>({
		defaultValues: { code: '' }
	})
	const passwordForm = useForm<PasswordFormValues>({
		defaultValues: { password: '', confirmPassword: '' }
	})

	const handleAxiosError = (error: unknown) => {
		if (axios.isAxiosError(error)) {
			toast.error(
				error.response?.data?.message ?? t('passwordRecoveryToastGenericError')
			)
		} else {
			toast.error(t('passwordRecoveryToastGenericError'))
		}
	}

	const {
		mutate: requestCode,
		isPending: isRequestingCode
	} = useMutation({
		mutationKey: ['password-reset-request'],
		mutationFn: (dto: IPasswordResetRequest) =>
			authService.requestPasswordReset(dto),
		onSuccess: (_, variables) => {
			setSubmittedEmail(variables.email)
			toast.success(t('passwordRecoveryToastCodeSent'))
			setStage('code')
		},
		onError: handleAxiosError
	})

	const {
		mutate: verifyCode,
		isPending: isVerifyingCode
	} = useMutation({
		mutationKey: ['password-reset-verify'],
		mutationFn: (dto: IPasswordResetVerify) =>
			authService.verifyResetCode(dto),
		onSuccess: (_, variables) => {
			setVerifiedCode(variables.code)
			toast.success(t('passwordRecoveryToastCodeConfirmed'))
			setStage('password')
		},
		onError: handleAxiosError
	})

	const {
		mutate: resetPassword,
		isPending: isResettingPassword
	} = useMutation({
		mutationKey: ['password-reset'],
		mutationFn: (dto: IPasswordResetPayload) =>
			authService.resetPassword(dto),
		onSuccess: () => {
			toast.success(t('passwordRecoveryToastPasswordUpdated'))
			router.push(PUBLIC_PAGES.LOGIN)
		},
		onError: handleAxiosError
	})

	const handleRequestCode = emailForm.handleSubmit(data => {
		requestCode(data)
	})

	const handleVerifyCode = codeForm.handleSubmit(({ code }) => {
		if (!submittedEmail) {
			toast.error(t('passwordRecoveryToastEmailMissing'))
			return
		}

		verifyCode({ code, email: submittedEmail })
	})

	const handleResetPassword = passwordForm.handleSubmit(
		({ password, confirmPassword }) => {
			if (!submittedEmail || !verifiedCode) {
				toast.error(t('passwordRecoveryToastVerificationRequired'))
				return
			}

			if (password !== confirmPassword) {
				toast.error(t('passwordRecoveryToastPasswordsMismatch'))
				return
			}

			resetPassword({ email: submittedEmail, code: verifiedCode, password })
		}
	)

	return {
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
		goToLogin: () => router.push(PUBLIC_PAGES.LOGIN)
	}
}
