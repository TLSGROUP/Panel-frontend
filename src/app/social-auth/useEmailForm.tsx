import userService from '@/services/user.service'
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import toast from 'react-hot-toast'

export function useEmailForm() {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const { mutate: updateEmail, isPending: isUpdating } = useMutation({
		mutationKey: ['update-email'],
		mutationFn: async (email: string) => userService.updateUserEmail(email),
		onSuccess() {
			startTransition(() => {
				router.push('/')
			})
		},
		onError(error) {
			if (axios.isAxiosError(error)) {
				toast.error(
					error.response?.data?.message || 'Ошибка при обновлении email'
				)
			}
		}
	})

	const isLoading = isPending || isUpdating

	return { updateEmail, isLoading }
}
