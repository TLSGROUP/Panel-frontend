import { instance } from '@/api/axios'
import { IUser } from '@/types/user.types'

export interface IPaginationResponse<T> {
	items: T[]
	isHasMore: boolean
}

export interface IPaginationParams {
	skip?: number
	take?: number
	searchTerm?: string
}

export interface IUserFormState extends Partial<Omit<IUser, 'id'>> {
	password?: string
}

export interface IUserReferral {
	id: string
	name?: string | null
	lastName?: string | null
	email: string
	phone?: string | null
	country?: string | null
	city?: string | null
	createdAt: string
}

export interface IUserReferralsResponse {
	success: boolean
	data: IUserReferral[]
	pagination: {
		page: number
		limit: number
		total_pages: number
		total_items: number
	}
}

export interface IUserReferralsParams {
	page?: number
	limit?: number
	search?: string
	from_date?: string
	to_date?: string
	sort_by?: string
	sort_order?: 'asc' | 'desc'
}

export type UpdateProfilePayload = Partial<{
	name: string | null
	lastName: string | null
	phone: string | null
	country: string | null
	city: string | null
	avatarPath: string | null
}>

export interface IDetectedCountry {
	countryCode: string | null
}

class UserService {
	private _BASE_URL = '/users'

	// Профиль текущего пользователя
	async fetchProfile() {
		return instance.get<IUser>(`${this._BASE_URL}/profile`)
	}

	// Контент для менеджеров
	async fetchManagerContent() {
		return instance.get<{ text: string }>(`${this._BASE_URL}/manager`)
	}

	// Список пользователей (админ)
	async fetchList() {
		return instance.get<IUser[]>(`${this._BASE_URL}/list`)
	}

	// Пагинированный список пользователей (новый админ-интерфейс)
	async fetchUsers(params?: IPaginationParams) {
		return instance.get<IPaginationResponse<IUser>>(`${this._BASE_URL}`, {
			params
		})
	}

	// Получить пользователя по id
	async fetchUserById(id: string | number) {
		return instance.get<IUser>(`${this._BASE_URL}/${id}`)
	}

	// Создать пользователя
	async createUser(payload: IUserFormState) {
		return instance.post<IUser>(`${this._BASE_URL}`, payload)
	}

	// Обновить пользователя
	async updateUser(id: string | number, payload: IUserFormState) {
		return instance.put<IUser>(`${this._BASE_URL}/${id}`, payload)
	}

	// Удалить пользователя
	async deleteUser(id: string | number) {
		return instance.delete<void>(`${this._BASE_URL}/${id}`)
	}

	// Обновление e-mail текущего пользователя
	async updateUserEmail(email: string) {
		return instance.patch(`${this._BASE_URL}/update-email`, { email })
	}

	// Обновление личных данных текущего пользователя
	async updateProfile(payload: UpdateProfilePayload) {
		return instance.patch<IUser>(`${this._BASE_URL}/profile`, payload)
	}

	async detectCountryByIp() {
		return instance.get<IDetectedCountry>(`${this._BASE_URL}/detect-country`)
	}

	async fetchUserReferrals(params?: IUserReferralsParams) {
		const response = await instance.get<IUserReferralsResponse>(
			`${this._BASE_URL}/referrals`,
			{
				params
			}
		)

		return response.data
	}
}

export default new UserService()
