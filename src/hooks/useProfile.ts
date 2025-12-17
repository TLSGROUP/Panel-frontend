import authService from '@/services/auth/auth.service'
import userService from '@/services/user.service'
import { transformUserToState } from '@/utils/transform-user-to-state'
import { useQuery } from '@tanstack/react-query'

const PROFILE_COMPLETION_FIELDS = ['lastName', 'phone', 'country', 'city'] as const
type ProfileCompletionField = (typeof PROFILE_COMPLETION_FIELDS)[number]

export function useProfile() {
	// Тянем профиль пользователя с периодическим обновлением
	const {
		data,
		isLoading,
		refetch: refetchProfile
	} = useQuery({
		queryKey: ['profile'],
		queryFn: () => userService.fetchProfile(),
		refetchInterval: 1800000 // 30 minutes
	})

	// Если профиля ещё нет — пробуем обновить токены
	useQuery({
		queryKey: ['new tokens'],
		queryFn: () => authService.getNewTokens(),
		enabled: !data?.data
	})

	const profile = data?.data

	const userState = profile ? transformUserToState(profile) : null

	const hasIncompleteProfile =
		Boolean(profile) &&
		PROFILE_COMPLETION_FIELDS.some((field: ProfileCompletionField) => {
			const value = profile?.[field]
			return typeof value !== 'string' || value.trim() === ''
		})

	return {
		isLoading,
		refetch: refetchProfile,
		user: {
			...profile,
			...userState
		},
		hasIncompleteProfile
	}
}
