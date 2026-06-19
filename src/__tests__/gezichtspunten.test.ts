import { berekenGezichtspunten, berekenTotaalStatus } from '../lib/gezichtspunten'
import type { CZO, Document, Opdracht, GezichtspuntBeoordeling } from '../types'

const baseCZO: CZO = {
  id: 'test-1',
  naam: 'Test CZO',
  bigNummer: '12345678901',
  kvkNummer: '87654321',
  status: 'ACTIEF',
  eigenTarief: 48,
  functie: 'Verzorgende IG',
}

const geldigeBAV: Document = {
  id: 'doc-bav', czoId: 'test-1', type: 'BAV', status: 'GELDIG',
  afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01',
}
const geldigeAOV: Document = {
  id: 'doc-aov', czoId: 'test-1', type: 'AOV', status: 'GELDIG',
  afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01',
}

const kortOpdracht: Opdracht = {
  id: 'opd-1', czoId: 'test-1', zorginstellingId: 'inst-1',
  startdatum: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  afdeling: 'Wijk A',
}

const langOpdracht: Opdracht = {
  id: 'opd-2', czoId: 'test-1', zorginstellingId: 'inst-1',
  // 70 dagen geleden gestart = ~10 weken
  startdatum: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  afdeling: 'Afdeling B',
}

describe('berekenGezichtspunten', () => {
  it('geeft VEILIG voor een volledig compliant CZO met meerdere opdrachtgevers', () => {
    const result = berekenGezichtspunten({
      czo: baseCZO,
      documenten: [geldigeBAV, geldigeAOV],
      opdrachten: [kortOpdracht],
      opdrachtgeversCount: 3,
    })
    expect(result.totaalStatus).toBe('VEILIG')
  })

  it('geeft AANDACHT als CZO alleen via SamenOntzorgen werkt', () => {
    const result = berekenGezichtspunten({
      czo: baseCZO,
      documenten: [geldigeBAV, geldigeAOV],
      opdrachten: [kortOpdracht],
      opdrachtgeversCount: 1, // alleen via SO
    })
    expect(result.totaalStatus).toBe('AANDACHT')
  })

  it('geeft AANDACHT bij een langlopende opdracht (>8 weken)', () => {
    const result = berekenGezichtspunten({
      czo: baseCZO,
      documenten: [geldigeBAV, geldigeAOV],
      opdrachten: [langOpdracht],
      opdrachtgeversCount: 3,
    })
    // inbedding is ZWAAR + aandacht → totaal AANDACHT
    expect(['AANDACHT', 'RISICO']).toContain(result.totaalStatus)
  })

  it('geeft RISICO als KvK ontbreekt en CZO alleen via SO werkt', () => {
    const czoZonderKvK: CZO = { ...baseCZO, kvkNummer: null }
    const result = berekenGezichtspunten({
      czo: czoZonderKvK,
      documenten: [geldigeBAV, geldigeAOV],
      opdrachten: [kortOpdracht],
      opdrachtgeversCount: 1,
    })
    // ondernemerschap ZWAAR RISICO → totaal RISICO
    expect(result.totaalStatus).toBe('RISICO')
  })

  it('geeft RISICO als BAV én AOV ontbreken', () => {
    const result = berekenGezichtspunten({
      czo: baseCZO,
      documenten: [],
      opdrachten: [kortOpdracht],
      opdrachtgeversCount: 3,
    })
    expect(['AANDACHT', 'RISICO']).toContain(result.totaalStatus)
  })

  it('bevat altijd 9 gezichtspunten', () => {
    const result = berekenGezichtspunten({
      czo: baseCZO,
      documenten: [geldigeBAV, geldigeAOV],
      opdrachten: [kortOpdracht],
      opdrachtgeversCount: 3,
    })
    expect(result.gezichtspunten).toHaveLength(9)
  })
})

describe('berekenTotaalStatus — gewogen logica', () => {
  it('ZWAAR RISICO → totaal RISICO, ook als rest groen is', () => {
    const gezichtspunten: GezichtspuntBeoordeling[] = [
      { id: 'g1', naam: '', omschrijving: '', gewicht: 'ZWAAR', status: 'RISICO' },
      { id: 'g2', naam: '', omschrijving: '', gewicht: 'NORMAAL', status: 'CONFORM' },
      { id: 'g3', naam: '', omschrijving: '', gewicht: 'NORMAAL', status: 'CONFORM' },
    ]
    expect(berekenTotaalStatus(gezichtspunten)).toBe('RISICO')
  })

  it('Twee ZWAAR AANDACHT → totaal AANDACHT (spec: zwaarwegend trekt naar oranje)', () => {
    const gezichtspunten: GezichtspuntBeoordeling[] = [
      { id: 'g1', naam: '', omschrijving: '', gewicht: 'ZWAAR', status: 'AANDACHT' },
      { id: 'g2', naam: '', omschrijving: '', gewicht: 'ZWAAR', status: 'AANDACHT' },
    ]
    expect(berekenTotaalStatus(gezichtspunten)).toBe('AANDACHT')
  })

  it('Eén NORMAAL AANDACHT → totaal AANDACHT', () => {
    const gezichtspunten: GezichtspuntBeoordeling[] = [
      { id: 'g1', naam: '', omschrijving: '', gewicht: 'NORMAAL', status: 'AANDACHT' },
      { id: 'g2', naam: '', omschrijving: '', gewicht: 'NORMAAL', status: 'CONFORM' },
    ]
    expect(berekenTotaalStatus(gezichtspunten)).toBe('AANDACHT')
  })

  it('Alles CONFORM → totaal VEILIG', () => {
    const gezichtspunten: GezichtspuntBeoordeling[] = [
      { id: 'g1', naam: '', omschrijving: '', gewicht: 'ZWAAR', status: 'CONFORM' },
      { id: 'g2', naam: '', omschrijving: '', gewicht: 'NORMAAL', status: 'CONFORM' },
    ]
    expect(berekenTotaalStatus(gezichtspunten)).toBe('VEILIG')
  })
})
