import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import type { IUserFormState } from '../user-form.types'

const validEmail =
	/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export function UserMainFields({
	errors,
	register,
}: {
	errors: FieldErrors<IUserFormState>
	register: UseFormRegister<IUserFormState>
}) {
	return (
		<div className='grid min-lg:grid-cols-2 gap-6'>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>Name</p>
				<Input {...register('name')} placeholder='Not provided' />
			</div>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>Last name</p>
				<Input {...register('lastName')} placeholder='Not provided' />
			</div>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>Email</p>
				<Input
					{...register('email', {
						required: 'Email is required field!',
						pattern: {
							value: validEmail,
							message: 'Пожалуйста введите валидный Email',
						},
					})}
					placeholder='Not provided'
					autoComplete='none'
				/>
			</div>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>Password</p>
				<Input
					{...register('password')}
					placeholder='••••••••'
					type='password'
				/>
			</div>
		</div>
	)
}
