import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
}
export function formatDateShort(date: Date | string) {
  return new Date(date).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})
}
export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n)
}
