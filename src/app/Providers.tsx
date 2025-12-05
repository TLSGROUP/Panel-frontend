'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { LazyMotion, domAnimation } from 'framer-motion'
import { type PropsWithChildren, useState } from 'react'
import { Toaster } from 'react-hot-toast'

export function Providers({ children }: PropsWithChildren) {
	const [client] = useState(new QueryClient())

	return (
		<LanguageProvider>
			<QueryClientProvider client={client}>
				<LazyMotion features={domAnimation}>{children}</LazyMotion>
				<Toaster />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</LanguageProvider>
	)
}
