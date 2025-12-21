'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { LazyMotion, domAnimation } from 'framer-motion'
import { type PropsWithChildren, useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { API_URL } from '@/constants'

export function Providers({ children }: PropsWithChildren) {
	// Создаём клиент React Query единожды на всё приложение
	const [client] = useState(new QueryClient())

	return (
		<LanguageProvider>
			{/* Провайдеры глобального состояния, анимаций и уведомлений */}
			<QueryClientProvider client={client}>
				<PlansSync />
				<LazyMotion features={domAnimation}>{children}</LazyMotion>
				<Toaster />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</LanguageProvider>
	)
}

function PlansSync() {
	const queryClient = useQueryClient()

	useEffect(() => {
		if (typeof window === 'undefined') return

		const handlePayload = (payload: string | null) => {
			if (!payload) return
			try {
				const parsed = JSON.parse(payload) as { plans?: unknown }
				if (Array.isArray(parsed.plans)) {
					queryClient.setQueryData(['plans'], parsed.plans)
					queryClient.invalidateQueries({ queryKey: ['plans'] })
				}
			} catch {
				// ignore invalid payloads
			}
		}

		let channel: BroadcastChannel | null = null
		if ('BroadcastChannel' in window) {
			channel = new BroadcastChannel('plans-updated')
			channel.addEventListener('message', (event) => {
				handlePayload(typeof event.data === 'string' ? event.data : null)
			})
		}

		const handleStorage = (event: StorageEvent) => {
			if (event.key === 'plans-updated') handlePayload(event.newValue)
		}

		window.addEventListener('storage', handleStorage)

		let eventSource: EventSource | null = null
		let retryTimer: number | null = null

		const connectSse = () => {
			if (eventSource) eventSource.close()
			eventSource = new EventSource(`${API_URL}/payments/plans/stream`)
			eventSource.onmessage = () => {
				queryClient.invalidateQueries({ queryKey: ['plans'] })
			}
			eventSource.onerror = () => {
				if (eventSource) eventSource.close()
				eventSource = null
				if (retryTimer) window.clearTimeout(retryTimer)
				retryTimer = window.setTimeout(connectSse, 2000)
			}
		}

		connectSse()

		return () => {
			if (channel) channel.close()
			window.removeEventListener('storage', handleStorage)
			if (eventSource) eventSource.close()
			if (retryTimer) window.clearTimeout(retryTimer)
		}
	}, [queryClient])

	return null
}
