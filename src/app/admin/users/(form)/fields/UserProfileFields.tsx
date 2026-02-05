import { Controller, type Control, type UseFormRegister } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import type { IUserFormState } from '../user-form.types'

export function UserProfileFields({
	control,
	register,
}: {
	control: Control<IUserFormState, any>
	register: UseFormRegister<IUserFormState>
}) {
	return (
		<div className='grid min-lg:grid-cols-2 gap-6 mt-6'>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>Phone</p>
				<Input {...register('phone')} placeholder='Not provided' />
			</div>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>Country</p>
				<Input {...register('country')} placeholder='Not provided' />
			</div>
			<div className='space-y-2'>
				<p className='text-sm text-muted-foreground'>City</p>
				<Input {...register('city')} placeholder='Not provided' />
			</div>
			<div>
				<Controller
					control={control}
					name='rights'
					render={({ field }) => {
						const current = field.value || []
						const toggle = (role: string, checked: boolean) => {
							const next = checked
								? Array.from(new Set([...current, role]))
								: current.filter((value: string) => value !== role)
							field.onChange(next)
						}

						return (
							<div className='space-y-3'>
								<p className='text-sm text-muted-foreground'>Roles</p>
								<div className='flex flex-wrap gap-4'>
									<label className='flex items-center gap-2 text-sm'>
										<Checkbox
											checked={current.includes('USER')}
											onCheckedChange={(checked) => toggle('USER', Boolean(checked))}
										/>
										User
									</label>
									<label className='flex items-center gap-2 text-sm'>
										<Checkbox
											checked={current.includes('MANAGER')}
											onCheckedChange={(checked) =>
												toggle('MANAGER', Boolean(checked))
											}
										/>
										Manager
									</label>
									<label className='flex items-center gap-2 text-sm'>
										<Checkbox
											checked={current.includes('ADMIN')}
											onCheckedChange={(checked) =>
												toggle('ADMIN', Boolean(checked))
											}
										/>
										Admin
									</label>
								</div>
							</div>
						)
					}}
				/>
			</div>
			<div className='space-y-3'>
				<p className='text-sm text-muted-foreground'>Verification status</p>
				<Controller
					control={control}
					name='isVerified'
					render={({ field }) => (
						<label className='flex items-center gap-2 text-sm'>
							<Checkbox
								checked={Boolean(field.value)}
								onCheckedChange={(checked) => field.onChange(Boolean(checked))}
							/>
							Verified
						</label>
					)}
				/>
			</div>
		</div>
	)
}
