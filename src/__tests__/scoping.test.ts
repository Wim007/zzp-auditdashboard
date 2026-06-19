import { instellingMagCZOZien, filterOpdrachtenVoorInstelling } from '../lib/scoping'
import type { Opdracht } from '../types'

const aktief: Opdracht = {
  id: 'opd-1', czoId: 'czo-1', zorginstellingId: 'inst-a',
  startdatum: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

const afgelopenRecent: Opdracht = {
  id: 'opd-2', czoId: 'czo-1', zorginstellingId: 'inst-a',
  startdatum: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 dagen geleden
}

const afgelopenOud: Opdracht = {
  id: 'opd-3', czoId: 'czo-1', zorginstellingId: 'inst-a',
  startdatum: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() - 370 * 24 * 60 * 60 * 1000).toISOString(), // 370 dagen geleden
}

const andereInstelling: Opdracht = {
  id: 'opd-4', czoId: 'czo-1', zorginstellingId: 'inst-b',
  startdatum: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

describe('instellingMagCZOZien', () => {
  it('mag zien als er een actieve opdracht is', () => {
    expect(instellingMagCZOZien('inst-a', [aktief])).toBe(true)
  })

  it('mag zien als er een recente afgesloten opdracht is (binnen bewaartermijn)', () => {
    expect(instellingMagCZOZien('inst-a', [afgelopenRecent])).toBe(true)
  })

  it('mag NIET zien als de opdracht ouder dan bewaartermijn is', () => {
    expect(instellingMagCZOZien('inst-a', [afgelopenOud])).toBe(false)
  })

  it('mag NIET zien als de opdracht van een andere instelling is', () => {
    expect(instellingMagCZOZien('inst-a', [andereInstelling])).toBe(false)
  })

  it('mag NIET zien als er geen opdrachten zijn', () => {
    expect(instellingMagCZOZien('inst-a', [])).toBe(false)
  })
})

describe('filterOpdrachtenVoorInstelling', () => {
  it('filtert correct op instelling', () => {
    const result = filterOpdrachtenVoorInstelling('inst-a', [aktief, andereInstelling])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('opd-1')
  })
})
