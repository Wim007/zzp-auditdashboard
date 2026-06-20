import type { Aandachtspunt, CZO, Document, Kwartaalaudit, Opdracht, VisueleStatus } from '@/types'

const ROOSTERVERVANGING_DREMPEL_WEKEN =
  parseInt(process.env.ROOSTERVERVANGING_DREMPEL_WEKEN ?? '8', 10)
const WAARSCHUWING_WINDOW_DAGEN = 14

/**
 * Berekent alle aandachtspunten voor één instelling op basis van haar CZO's en opdrachten.
 */
export function berekenAandachtspunten(params: {
  czos: CZO[]
  documentenPerCZO: Record<string, Document[]>
  opdrachtenPerCZO: Record<string, Opdracht[]>
  opdrachtgeversCountPerCZO: Record<string, number>
  kwartaalaudits: Kwartaalaudit[]
  zorginstellingId: string
  zorginstellingNaam: string
}): Aandachtspunt[] {
  const {
    czos,
    documentenPerCZO,
    opdrachtenPerCZO,
    opdrachtgeversCountPerCZO,
    kwartaalaudits,
    zorginstellingId,
    zorginstellingNaam,
  } = params

  const punten: Aandachtspunt[] = []

  for (const czo of czos) {
    const opdrachten = opdrachtenPerCZO[czo.id] ?? []
    const documenten = documentenPerCZO[czo.id] ?? []
    const opdrachtgeversCount = opdrachtgeversCountPerCZO[czo.id] ?? 1

    // Roostervervanging-signaal: aaneengesloten inzet > drempel op dezelfde afdeling
    const instellingOpdrachten = opdrachten.filter(
      (o) => o.zorginstellingId === zorginstellingId
    )
    for (const opdracht of instellingOpdrachten) {
      const start = new Date(opdracht.startdatum)
      const nu = new Date()
      const deadline = new Date(start)
      deadline.setDate(deadline.getDate() + ROOSTERVERVANGING_DREMPEL_WEKEN * 7)
      const dagenResterend = Math.ceil((deadline.getTime() - nu.getTime()) / (1000 * 60 * 60 * 24))

      if (dagenResterend <= WAARSCHUWING_WINDOW_DAGEN) {
        const czoNaam = czo.bedrijfsnaam ?? czo.naam
        const opdrachtgeverNaam = opdracht.zorginstellingNaam ?? zorginstellingNaam
        const omschrijving = dagenResterend <= 0
          ? `${czoNaam} heeft de maximale aaneengesloten periode (${ROOSTERVERVANGING_DREMPEL_WEKEN} weken) al overschreden bij ${opdrachtgeverNaam}. Direct actie vereist.`
          : `Over ${dagenResterend} dag${dagenResterend === 1 ? '' : 'en'} bereikt ${czoNaam} de maximale aaneengesloten periode (${ROOSTERVERVANGING_DREMPEL_WEKEN} weken) bij ${opdrachtgeverNaam}. Plan een vervanger in.`

        punten.push({
          id: `roostervervanging-${czo.id}-${opdracht.id}`,
          type: 'ROOSTERVERVANGING',
          czoId: czo.id,
          czoNaam,
          zorginstellingId,
          zorginstellingNaam,
          omschrijving,
          status: 'OPEN',
          ernst: dagenResterend <= 0 ? 'RISICO' : 'AANDACHT',
          metadata: { opdrachtId: opdracht.id, dagenResterend, deadline: deadline.toISOString() },
        })
      }
    }

    // Weinig opdrachtgevers-signaal
    if (opdrachtgeversCount < 3) {
      punten.push({
        id: `weinig-opdrachtgevers-${czo.id}`,
        type: 'WEINIG_OPDRACHTGEVERS',
        czoId: czo.id,
        czoNaam: czo.bedrijfsnaam ?? czo.naam,
        omschrijving: `${czo.bedrijfsnaam ?? czo.naam} heeft in het afgelopen jaar bij ${opdrachtgeversCount} opdrachtgever${opdrachtgeversCount === 1 ? '' : 's'} gewerkt. Doel is 3 of meer opdrachtgevers per jaar.`,
        status: 'OPEN',
        ernst: 'AANDACHT',
      })
    }

    // Ontbrekend ondernemersdossier (geen KvK)
    if (!czo.kvkNummer) {
      punten.push({
        id: `geen-ondernemers-${czo.id}`,
        type: 'GEEN_ONDERNEMERSDOSSIER',
        czoId: czo.id,
        czoNaam: czo.naam,
        omschrijving: `${czo.naam} heeft geen KvK-nummer geregistreerd. Ondernemerschap is niet aantoonbaar.`,
        status: 'OPEN',
        ernst: 'RISICO',
      })
    }

    // Documenten met status AANDACHT
    for (const doc of documenten) {
      if (doc.status === 'AANDACHT' || doc.status === 'ONTBREEKT') {
        punten.push({
          id: `document-${czo.id}-${doc.id}`,
          type: 'DOCUMENT_AANDACHT',
          czoId: czo.id,
          czoNaam: czo.naam,
          omschrijving: `Document "${doc.type}" van ${czo.naam} heeft status "${doc.status}".`,
          status: 'OPEN',
          ernst: doc.status === 'ONTBREEKT' ? 'RISICO' : 'AANDACHT',
        })
      }
    }
  }

  // Kwartaalaudit openstaand
  const openAudits = kwartaalaudits.filter((a) => a.status === 'CONCEPT')
  for (const audit of openAudits) {
    punten.push({
      id: `audit-${audit.id}`,
      type: 'AUDIT_OPENSTAAND',
      zorginstellingId,
      zorginstellingNaam,
      omschrijving: `Kwartaalaudit ${audit.kwartaal} is nog niet ondertekend.`,
      status: 'OPEN',
      ernst: 'AANDACHT',
    })
  }

  return punten
}

export function berekenVisueleStatusVoorInstelling(
  aandachtspunten: Aandachtspunt[]
): VisueleStatus {
  if (aandachtspunten.some((a) => a.ernst === 'RISICO' && a.status === 'OPEN')) return 'RISICO'
  if (aandachtspunten.some((a) => a.ernst === 'AANDACHT' && a.status === 'OPEN')) return 'AANDACHT'
  return 'VEILIG'
}
