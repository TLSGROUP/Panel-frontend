import { ManagerDashboard } from "@/app/manager/ManagerDashboard"
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Manager content'
}

export default function ManagerPage() {
	return <ManagerDashboard />
}
