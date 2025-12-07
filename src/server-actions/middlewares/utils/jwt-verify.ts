'use server'

import { ITokenInside } from '@/types/auth.types'
import { transformUserToState } from '@/utils/transform-user-to-state'
import * as jose from 'jose'

// Проверяем JWT на сервере и приводим payload к нужному виду
export async function jwtVerifyServer(accessToken: string) {
	try {
		const { payload }: { payload: ITokenInside } = await jose.jwtVerify(
			accessToken,
			new TextEncoder().encode(`${process.env.JWT_SECRET}`)
		)

		if (!payload) return null

		return transformUserToState(payload)
	} catch (error) {
		// Обработка ошибок, связанных с верификацией JWT
		if (
			error instanceof Error &&
			error.message.includes('exp claim timestamp check failed')
		) {
			// Токен истек
			console.log('Токен истек')
			return null
		}

		console.log('Ошибка при верификации токена: ', error)
		return null
	}
}
