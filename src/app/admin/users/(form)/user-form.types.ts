import { IUser } from '@/types/user.types'
import type { SubmitHandler } from 'react-hook-form'

export interface IUserFormState extends Omit<IUser, 'id'> {
	password?: string
	isVerified?: boolean
}
export type TypeUserForm = 'create' | 'edit' | 'update-profile'

export interface IQueriesResult {
	data?: Omit<IUser, 'password'>
	isLoading?: boolean
	initialUserLoading?: boolean
	isNeedResetForm?: boolean
	onSubmit: SubmitHandler<IUserFormState>
}

export interface IUserForm {
	type: TypeUserForm
	id?: string
	queriesResult: IQueriesResult
}

export interface UserFormProps {
	type: TypeUserForm
	id?: string
	onSuccess?: () => void
}
