import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { SubmitHandler } from 'react-hook-form'
import toast from 'react-hot-toast'

import userService from '@/services/user.service'
import { useMutation, useQuery } from '@tanstack/react-query'
import type { IQueriesResult, IUserFormState } from './user-form.types'

export function useUserQueries(
	id = '',
	isCreateForm: boolean,
	onSuccess?: () => void
): IQueriesResult {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ['user', id],
		queryFn: () => userService.fetchUserById(id),
		enabled: Boolean(id),
	})

	const { push } = useRouter()
	const [isNeedResetForm, setIsNeedResetForm] = useState(false)

	const { mutate: createUser } = useMutation({
		mutationKey: ['createUser'],
		mutationFn: (data: IUserFormState) => userService.createUser(data),
		onSuccess() {
			toast.success('Пользователь успешно создан!')
			refetch()
			setIsNeedResetForm(true)
			push('/')
		},
	})

	const { mutate: updateUser, isPending: isLoadingUpdate } = useMutation({
		mutationKey: ['updateUser'],
		mutationFn: (data: IUserFormState) => userService.updateUser(id, data),
		onSuccess() {
			toast.success('User updated')
			refetch()
			onSuccess?.()
		},
		onError(error: any) {
			console.error('Failed to update user', error)
			const message =
				error?.response?.data?.message ||
				error?.message ||
				'Failed to update user'
			toast.error(message)
		},
	})

	const onSubmit: SubmitHandler<IUserFormState> = async data => {
		const payload = { ...data }
		if (!payload.password) {
			delete payload.password
		}
		if (isCreateForm) {
			createUser(payload)
		} else if (id) {
			updateUser(payload)
		}
	}

	return {
		data: data?.data,
		isLoading: isLoading || isLoadingUpdate,
		initialUserLoading: isLoading,
		onSubmit,
		isNeedResetForm,
	}
}
