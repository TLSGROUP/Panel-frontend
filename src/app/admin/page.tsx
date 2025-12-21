import { AdminDashboard } from "@/app/admin/AdminDashboard"

import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Admin'
}

export default function AdminPage() {
	return <AdminDashboard />
}
