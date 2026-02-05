'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import Skeleton from 'react-loading-skeleton'
import { UserFormHeading } from './UserFormHeading'
import { UserMainFields } from './fields/UserMainFields'
import { UserProfileFields } from './fields/UserProfileFields'
import type { IUserForm, IUserFormState } from './user-form.types'

export function UserEditingForm({
	type,
	queriesResult: {
		onSubmit,
		data,
		initialUserLoading,
		isLoading,
		isNeedResetForm,
	},
}: IUserForm) {
	const {
		control,
		formState: { errors },
		register,
		handleSubmit,
		reset,
		watch,
	} = useForm<IUserFormState>({
		mode: 'onChange',
	})

	useEffect(() => {
		if (!data) return
		if (watch('email') && type === 'edit') return

		reset({
			country: data.country,
			city: data.city,
			email: data.email,
			lastName: data.lastName,
			name: data.name,
			phone: data.phone,
			rights: data.rights,
			isVerified: !data.verificationToken,
		})
	}, [data])

	useEffect(() => {
		if (isNeedResetForm) reset()
	}, [isNeedResetForm, reset])

	if (initialUserLoading) return <Skeleton />

	return (
		<div className='p-6'>
			<form
				className='min-lg:mt-10 mt-5'
				autoComplete='off'
				onSubmit={handleSubmit(onSubmit)}
				encType='multipart/form-data'
			>
				<UserMainFields errors={errors} register={register} />
				<UserProfileFields control={control} register={register} />

				<Button
					variant='default'
					className='min-lg:mt-10 mt-5'
					disabled={isLoading}
					type='submit'
				>
					{type === 'create' ? 'Create' : 'Save'}
				</Button>
			</form>

		</div>
	)
}
