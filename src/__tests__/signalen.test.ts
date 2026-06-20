import { berekenAandachtspunten, berekenVisueleStatusVoorInstelling } from '../lib/signalen'
import type { CZO, Opdracht } from '../types'

const czoZonderKvK: CZO = {
  id: 'czo-1', naam: 'Test', bigNummer: '123', kvkNummer: null,
  status: 'ACTIEF', eigenTarief: 48, functie: 'Verzorgende IG',
}

const czoMetKvK: CZO = { ...czoZonderKvK, kvkNummer: '87654321' }

const langOpdracht: Opdracht = {
  id: 'opd-1', czoId: 'czo-1', zorginstellingId: 'inst-a',
  startdatum: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
  einddatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  afdeling: 'Afdeling A',
}

describe('berekenAandachtspunten', () => {
  it('detecteert roostervervanging-signaal bij opdracht > 8 weken', () => {
    const punten = berekenAandachtspunten({
      czos: [czoMetKvK],
      documentenPerCZO: { 'czo-1': [] },
      opdrachtenPerCZO: { 'czo-1': [langOpdracht] },
      opdrachtgeversCountPerCZO: { 'czo-1': 2 },
      kwartaalaudits: [],
      zorginstellingId: 'inst-a',
      zorginstellingNaam: 'Instelling A',
    })
    expect(punten.some(p => p.type === 'ROOSTERVERVANGING')).toBe(true)
  })

  it('detecteert alleen-via-SO-signaal als opdrachtgevercount <= 1', () => {
    const punten = berekenAandachtspunten({
      czos: [czoMetKvK],
      documentenPerCZO: { 'czo-1': [] },
      opdrachtenPerCZO: { 'czo-1': [] },
      opdrachtgeversCountPerCZO: { 'czo-1': 1 },
      kwartaalaudits: [],
      zorginstellingId: 'inst-a',
      zorginstellingNaam: 'Instelling A',
    })
    expect(punten.some(p => p.type === 'WEINIG_OPDRACHTGEVERS')).toBe(true)
  })

  it('detecteert ontbrekend ondernemersdossier (geen KvK)', () => {
    const punten = berekenAandachtspunten({
      czos: [czoZonderKvK],
      documentenPerCZO: { 'czo-1': [] },
      opdrachtenPerCZO: { 'czo-1': [] },
      opdrachtgeversCountPerCZO: { 'czo-1': 2 },
      kwartaalaudits: [],
      zorginstellingId: 'inst-a',
      zorginstellingNaam: 'Instelling A',
    })
    expect(punten.some(p => p.type === 'GEEN_ONDERNEMERSDOSSIER')).toBe(true)
  })
})

describe('berekenVisueleStatusVoorInstelling', () => {
  it('geeft RISICO als er een open RISICO-punt is', () => {
    const punten = [{ id: '1', type: 'GEEN_ONDERNEMERSDOSSIER' as const, omschrijving: '', status: 'OPEN' as const, ernst: 'RISICO' as const }]
    expect(berekenVisueleStatusVoorInstelling(punten)).toBe('RISICO')
  })

  it('geeft AANDACHT als er een open AANDACHT-punt is', () => {
    const punten = [{ id: '1', type: 'WEINIG_OPDRACHTGEVERS' as const, omschrijving: '', status: 'OPEN' as const, ernst: 'AANDACHT' as const }]
    expect(berekenVisueleStatusVoorInstelling(punten)).toBe('AANDACHT')
  })

  it('geeft VEILIG als er geen open punten zijn', () => {
    expect(berekenVisueleStatusVoorInstelling([])).toBe('VEILIG')
  })
})
