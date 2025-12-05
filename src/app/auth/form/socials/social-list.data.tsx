import type { ReactElement } from 'react'
import type { IconType } from 'react-icons'
import { FcGoogle } from 'react-icons/fc'

export type TSocials =
	| 'google'

export type SocialItem = {
	id: TSocials
	icon: ReactElement<IconType>
	name: string
}

export const socialsList = (iconSize = 22): SocialItem[] => [
	{ id: 'google', icon: <FcGoogle size={iconSize} />, name: 'Google' }
]
