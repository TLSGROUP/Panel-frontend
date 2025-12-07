import { instance } from '@/api/axios'
import { IUser } from '@/types/user.types'

export interface IPaginationResponse<T> {
	data: T[]
	isHasMore: boolean
}

export interface IPaginationParams {
	skip?: number
	take?: number
	searchTerm?: string
}

class UserService {
	private _BASE_URL = '/users'

	async fetchProfile() {
		return instance.get<IUser>(`${this._BASE_URL}/profile`)
	}

	async fetchManagerContent() {
		return instance.get<{ text: string }>(`${this._BASE_URL}/manager`)
	}

	async fetchList() {
		return instance.get<IUser[]>(`${this._BASE_URL}/list`)
	}

	async updateUserEmail(email: string) {
		return instance.patch(`${this._BASE_URL}/update-email`, { email })
	}
}

export default new UserService()
