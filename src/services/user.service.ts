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
}

export default new UserService()
