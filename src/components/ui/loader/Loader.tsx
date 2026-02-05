import { MiniLoader } from "../MiniLoader"

interface LoaderProps {
  size?: number
  isDark?: boolean
}

export function Loader({ size = 20, isDark }: LoaderProps) {
  return <MiniLoader width={size} height={size} isDark={isDark} />
}
