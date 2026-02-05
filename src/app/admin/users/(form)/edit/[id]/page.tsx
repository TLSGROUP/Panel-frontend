import type { Metadata } from 'next'
import { UserForm } from '../../UserForm'

export const metadata: Metadata = {
	title: 'Редактирование пользователя',
}

export default async function EditUserPage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	const { id } = await params
	return <UserForm type='edit' id={id} />
}
