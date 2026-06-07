import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Fusionne des classes Tailwind en gérant les conflits. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Formate un montant en francs CFA (ex. 150000 -> « 150 000 FCFA »). */
export function formatFcfa(amount: number | null | undefined) {
  const value = typeof amount === 'number' ? amount : 0
  return `${new Intl.NumberFormat('fr-FR').format(value)} FCFA`
}

/** Initiales à partir d'un nom complet (ex. « Justine Kem » -> « JK »). */
export function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
