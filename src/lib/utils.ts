import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Удобный хелпер для объединения классов с поддержкой tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
