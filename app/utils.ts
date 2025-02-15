import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const fileName = (path: string) =>
  path.split('/').pop()?.split('.').slice(0, -1).join('.')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
