import type { Metadata } from 'next'
import { Fira_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './Providers'
import { Toaster } from 'react-hot-toast'

const FiraMono = Fira_Mono({
	subsets: ['cyrillic', 'latin'],
	weight: '400'
})

export const metadata: Metadata = {
	title: 'Network Pro MLM'
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
					<main className="flex min-h-screen flex-col items-center justify-between p-8">
						{children}
					</main>
					<Toaster />
				</Providers>
			</body>
		</html>
	)
}
