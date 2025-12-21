'use client'

import { PUBLIC_PAGES } from '@/config/pages/public.config'
import authService from '@/services/auth/auth.service'
import { IFormData } from '@/types/auth.types'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useLanguage } from '@/context/LanguageContext'

export function useAuthForm(isLogin: boolean) {
	const { register, handleSubmit, reset, setValue } = useForm<IFormData>()

	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const searchParams = useSearchParams()

	const recaptchaRef = useRef<ReCAPTCHA>(null)
	const { language, t } = useLanguage()

	const { mutate: mutateLogin, isPending: isLoginPending } = useMutation({
		mutationKey: ['login'],
		mutationFn: (data: IFormData) =>
			authService.main('login', data, recaptchaRef.current?.getValue()),
		onSuccess() {
			startTransition(() => {
				reset()
				router.push(PUBLIC_PAGES.HOME)
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message)
			}
		}
	})

	const { mutate: mutateRegister, isPending: isRegisterPending } = useMutation({
		mutationKey: ['register'],
		mutationFn: (data: IFormData) =>
			authService.main('register', data, recaptchaRef.current?.getValue()),
		onSuccess() {
			startTransition(() => {
				reset()
				router.push(PUBLIC_PAGES.HOME)
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(error.response?.data?.message)
			}
		}
	})

	useEffect(() => {
		if (isLogin) return
		const refCode = searchParams.get('ref')
		if (refCode) {
			setValue('referralCode', refCode)
		}
	}, [isLogin, searchParams, setValue])

	const onSubmit: SubmitHandler<IFormData> = data => {
		const token = recaptchaRef.current?.getValue()

		if (!token) {
			toast.error(t('captchaError'))
			return
		}

		if (isLogin) {
			mutateLogin(data)
		} else {
			const referralCode = data.referralCode?.trim()
			mutateRegister({
				...data,
				referralCode: referralCode || undefined,
				language
			})
		}
	}

	const isLoading = isPending || isLoginPending || isRegisterPending

	return {
		register,
		handleSubmit,
		onSubmit,
		recaptchaRef,
		isLoading
	}
}
