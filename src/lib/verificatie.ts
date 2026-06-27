// Bronverificatie: koppelt dossiervelden aan externe controlebronnen of interne documenten.

export type VerificatieActieType = 'EXTERN' | 'DOCUMENT' | 'DOSSIER'
export type BronSoort = 'KVK' | 'BIG' | 'WEBSITE' | 'LINKEDIN' | 'UPLOAD' | 'INTERN'

export const bronLabel: Record<BronSoort, string> = {
  KVK: 'KVK',
  BIG: 'BIG-register',
  WEBSITE: 'Openbare website',
  LINKEDIN: 'LinkedIn',
  UPLOAD: 'Upload document',
  INTERN: 'Interne registratie',
}

export const actieLabel: Record<VerificatieActieType, string> = {
  EXTERN: 'Controleer extern',
  DOCUMENT: 'Bekijk document',
  DOSSIER: 'Bekijk dossier',
}

export function kvkZoekUrl(kvkNummer: string): string {
  return `https://www.kvk.nl/zoeken/?source=kvkzoeken&q=${encodeURIComponent(kvkNummer)}`
}

export function bigZoekUrl(bigNummer: string): string {
  return `https://zoeken.bigregister.nl/?bignummer=${encodeURIComponent(bigNummer)}`
}
