import type { Metadata } from 'next'
import { AuthPageWrapper } from '../AuthPageWrapper'
import { PasswordRecoveryForm } from '../form/PasswordRecoveryForm'

export const metadata: Metadata = {
	title: 'Forgot password'
}

export default function ForgotPasswordPage() {
	return (
		<AuthPageWrapper heading="Restore access">
			<PasswordRecoveryForm />
		</AuthPageWrapper>
	)
}
