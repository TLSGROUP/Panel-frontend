import type { TypeUserForm } from './user-form.types'

export function UserFormHeading({
	type,
	email,
	id,
}: {
	type: TypeUserForm
	email?: string
	id?: string
}) {
	switch (type) {
		case 'create':
			return 'Создание пользователя'

		case 'edit':
			return `Редактирование "${email || id || 'user'}"`

		default:
			return 'Редактирование профиля'
	}
}
