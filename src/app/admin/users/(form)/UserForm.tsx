'use client'

import { UserEditingForm } from './UserEditingForm'
import { useUserQueries } from './useUserQueries'
import { type IUserForm, type UserFormProps } from './user-form.types'

export function UserForm({ type, id, onSuccess }: UserFormProps) {
	const result = useUserQueries(id, type === 'create', onSuccess)

	return <UserEditingForm queriesResult={result} type={type} id={id} />
}
