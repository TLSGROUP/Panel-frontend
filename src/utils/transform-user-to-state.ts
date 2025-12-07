import { UserRole, type TProtectUserData } from '@/types/auth.types'

export type TUserDataState = {
	id: number
	rights: UserRole[]
	isLoggedIn: boolean
	isAdmin: boolean
	isManager: boolean
}

// Помогаем определить статус пользователя (админ/менеджер/авторизован)
export const transformUserToState = (
	user: TProtectUserData
): TUserDataState | null => {
	return {
		...user,
		isLoggedIn: true,
		isAdmin: user.rights.includes(UserRole.ADMIN),
		isManager: user.rights.includes(UserRole.MANAGER)
	}
}
