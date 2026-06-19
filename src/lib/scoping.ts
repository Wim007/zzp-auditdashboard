import type { Opdracht } from '@/types'

const BEWAARTERMIJN_DAGEN = parseInt(process.env.DOSSIER_BEWAARTERMIJN_DAGEN ?? '365', 10)

/**
 * Geeft true als een instelling-gebruiker nog toegang heeft tot een CZO-dossier.
 * De instelling mag het dossier zien als er een actieve of recente (binnen bewaartermijn) opdracht is.
 * Afdwingen op API-niveau — niet alleen in de UI.
 */
export function instellingMagCZOZien(
  zorginstellingId: string,
  czOpdrachten: Opdracht[]
): boolean {
  const nu = new Date()
  const grens = new Date(nu.getTime() - BEWAARTERMIJN_DAGEN * 24 * 60 * 60 * 1000)

  return czOpdrachten.some((o) => {
    if (o.zorginstellingId !== zorginstellingId) return false
    // actieve opdracht (geen einddatum of einddatum in de toekomst)
    if (!o.einddatum) return true
    const eind = new Date(o.einddatum)
    // of afgelopen opdracht binnen de bewaartermijn
    return eind >= grens
  })
}

/**
 * Filtert de opdrachtenlijst zodat een instelling-gebruiker alleen
 * opdrachten ziet die bij zijn instelling horen.
 */
export function filterOpdrachtenVoorInstelling(
  zorginstellingId: string,
  opdrachten: Opdracht[]
): Opdracht[] {
  return opdrachten.filter((o) => o.zorginstellingId === zorginstellingId)
}

/**
 * Controleert of een opdracht nog actief is (geen einddatum of einddatum in de toekomst).
 */
export function isActieveOpdracht(opdracht: Opdracht): boolean {
  if (!opdracht.einddatum) return true
  return new Date(opdracht.einddatum) >= new Date()
}
