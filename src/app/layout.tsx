import type { Metadata } from 'next'
import { Fira_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './Providers'
import { LanguagePicker } from '@/components/language/LanguagePicker'

const FiraMono = Fira_Mono({
	subsets: ['cyrillic', 'latin'],
	weight: '400'
})

export const metadata: Metadata = {
	title: 'Network Pro MLM',
	description: 'Network Pro MLM dashboard'
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en">
			<body className={FiraMono.className}>
				<Providers>
					<>
						<LanguagePicker />
						<main className="flex min-h-screen flex-col items-center justify-between p-8">
							{children}
						</main>
					</>
				</Providers>
			</body>
		</html>
	)
}
