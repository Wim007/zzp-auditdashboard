import type {
  CZO,
  Document,
  Opdracht,
  GezichtspuntBeoordeling,
  GezichtspuntenScore,
  VisueleStatus,
} from '@/types'

export interface GezichtspuntenInput {
  czo: CZO
  documenten: Document[]
  opdrachten: Opdracht[]
  opdrachtgeversCount: number
}

// De 9 gezichtspunten uit het Deliveroo-arrest (HR 24 maart 2023, ECLI:NL:HR:2023:443)
// aangevuld met het Uber-arrest (HR 21 februari 2025, ECLI:NL:HR:2025:319).
// Gewichten: ZWAAR = 3, NORMAAL = 1, LICHT = 0.5
// In de zorg wegen inbedding, gezag en ondernemerschap het zwaarst.

const ROOSTERVERVANGING_DREMPEL_WEKEN = 8

export function berekenGezichtspunten(input: GezichtspuntenInput): GezichtspuntenScore {
  const { czo, documenten, opdrachten, opdrachtgeversCount } = input

  const heeftKvK = Boolean(czo.kvkNummer && czo.kvkNummer.length > 0)
  const heeftBAV = documenten.some((d) => d.type === 'BAV' && d.status === 'GELDIG')
  const heeftAOV = documenten.some((d) => d.type === 'AOV' && d.status === 'GELDIG')
  const heeftEigenTarief = czo.eigenTarief != null && Number(czo.eigenTarief) > 0
  const alleenViaSamenOntzorgen = opdrachtgeversCount <= 1

  const actiefOpdrachten = opdrachten.filter((o) => !o.einddatum || new Date(o.einddatum) >= new Date())
  const langeLoopendeOpdrachten = opdrachten.filter((o) => {
    const start = new Date(o.startdatum)
    const eind = o.einddatum ? new Date(o.einddatum) : new Date()
    const weken = (eind.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
    return weken > ROOSTERVERVANGING_DREMPEL_WEKEN
  })

  const gezichtspunten: GezichtspuntBeoordeling[] = [
    {
      id: 'aard-en-duur',
      naam: 'Aard en duur van de werkzaamheden',
      omschrijving: 'De werkzaamheden zijn tijdelijk, afgebakend en niet structureel identiek aan die van vaste medewerkers.',
      gewicht: 'NORMAAL',
      ...beoordeelAardEnDuur(actiefOpdrachten, langeLoopendeOpdrachten),
    },
    {
      id: 'inbedding',
      naam: 'Inbedding in de organisatie',
      omschrijving: 'De CZO werkt niet structureel ingebed in de organisatie van de instelling; opdrachten zijn tijdelijk en afgebakend.',
      gewicht: 'ZWAAR',
      ...beoordeelInbedding(langeLoopendeOpdrachten),
    },
    {
      id: 'gezag',
      naam: 'Gezag en instructiebevoegdheid',
      omschrijving: 'De CZO bepaalt zelfstandig hoe de werkzaamheden worden uitgevoerd; de instelling geeft geen hiërarchische instructies.',
      gewicht: 'ZWAAR',
      ...beoordeelGezag(czo),
    },
    {
      id: 'persoonlijke-arbeid',
      naam: 'Persoonlijke arbeidsverplichting',
      omschrijving: 'Er is geen verplichting het werk persoonlijk uit te voeren; de CZO kan zich laten vervangen.',
      gewicht: 'NORMAAL',
      status: 'CONFORM',
      toelichting: 'Via de coöperatie is vervanging geregeld; er is geen persoonlijke inzetplicht.',
    },
    {
      id: 'werktijden',
      naam: 'Werktijden en eigen agenda',
      omschrijving: 'De CZO kiest zelf welke opdrachten hij/zij aanneemt; er is geen verplichting een opdracht te accepteren.',
      gewicht: 'NORMAAL',
      status: 'CONFORM',
      toelichting: "CZO's accepteren opdrachten op vrijwillige basis via de coöperatie; geen vaste diensten verplicht.",
    },
    {
      id: 'eigen-middelen',
      naam: 'Eigen middelen en werkomgeving',
      omschrijving: 'In de thuiszorg/VVT worden materialen doorgaans door de instelling verstrekt; dit is een aandachtspunt dat gecompenseerd wordt door andere factoren.',
      gewicht: 'LICHT',
      status: 'AANDACHT',
      toelichting: 'Zorgmateriaal wordt door instelling verstrekt (sector-gebruikelijk). Wordt gecompenseerd door eigen BAV, AOV en eigen tarief.',
      mitigatie: 'Eigen beroepsaansprakelijkheidsverzekering dekt professioneel risico.',
    },
    {
      id: 'financieel-risico',
      naam: 'Financieel risico',
      omschrijving: 'De CZO draagt eigen financieel risico: geen gewaarborgd inkomen bij ziekte of geen opdrachten, eigen beroepsaansprakelijkheid.',
      gewicht: 'NORMAAL',
      ...beoordeelFinancieelRisico(heeftBAV, heeftAOV),
    },
    {
      id: 'ondernemerschap',
      naam: 'Ondernemerschap',
      omschrijving: 'De CZO is ingeschreven bij de KvK, stelt een eigen tarief, werkt voor meerdere opdrachtgevers en investeert in eigen scholing.',
      gewicht: 'ZWAAR',
      ...beoordeelOndernemerschap(heeftKvK, heeftEigenTarief, alleenViaSamenOntzorgen, opdrachtgeversCount),
    },
    {
      id: 'economische-afhankelijkheid',
      naam: 'Economische afhankelijkheid',
      omschrijving: 'De CZO is niet economisch afhankelijk van één opdrachtgever; inkomen is gespreid over meerdere instellingen.',
      gewicht: 'ZWAAR',
      ...beoordeelEconomischeAfhankelijkheid(alleenViaSamenOntzorgen, opdrachtgeversCount),
    },
  ]

  const totaalStatus = berekenTotaalStatus(gezichtspunten)

  return { gezichtspunten, totaalStatus }
}

function beoordeelAardEnDuur(
  actief: Opdracht[],
  langLoopend: Opdracht[]
): Pick<GezichtspuntBeoordeling, 'status' | 'toelichting' | 'mitigatie'> {
  if (langLoopend.length > 0) {
    return {
      status: 'AANDACHT',
      toelichting: `${langLoopend.length} opdracht(en) lopen langer dan ${ROOSTERVERVANGING_DREMPEL_WEKEN} weken aaneengesloten. Dit verhoogt het inbeddingsrisico.`,
      mitigatie: 'Overweeg opdracht te beëindigen of aantoonbaar te wisselen van afdeling/locatie.',
    }
  }
  return {
    status: 'CONFORM',
    toelichting: `Alle opdrachten zijn tijdelijk en afgebakend. Aantal actieve opdrachten: ${actief.length}.`,
  }
}

function beoordeelInbedding(
  langLoopend: Opdracht[]
): Pick<GezichtspuntBeoordeling, 'status' | 'toelichting' | 'mitigatie'> {
  if (langLoopend.length > 0) {
    return {
      status: 'AANDACHT',
      toelichting: `${langLoopend.length} opdracht(en) lopen aaneengesloten langer dan ${ROOSTERVERVANGING_DREMPEL_WEKEN} weken op dezelfde afdeling. Dit is het zwaarst wegende signaal voor schijnzelfstandigheid.`,
      mitigatie: 'Beëindig opdracht of varieer actief de inzet (andere afdeling/andere instelling).',
    }
  }
  return {
    status: 'CONFORM',
    toelichting: 'Geen structurele inbedding vastgesteld. Opdrachten zijn tijdelijk en afgebakend.',
  }
}

function beoordeelGezag(
  czo: CZO
): Pick<GezichtspuntBeoordeling, 'status' | 'toelichting'> {
  return {
    status: 'CONFORM',
    toelichting: "CZO's werken op basis van een opdrachtovereenkomst via de coöperatie, zonder hiërarchisch gezag van de instelling. De instelling bepaalt het wat (zorgvraag), de CZO bepaalt het hoe (uitvoering).",
  }
}

function beoordeelFinancieelRisico(
  heeftBAV: boolean,
  heeftAOV: boolean
): Pick<GezichtspuntBeoordeling, 'status' | 'toelichting' | 'mitigatie'> {
  if (!heeftBAV && !heeftAOV) {
    return {
      status: 'RISICO',
      toelichting: 'Geen BAV en geen AOV geregistreerd. Financieel risico is niet aantoonbaar gedragen.',
      mitigatie: 'Verlang bewijs van geldige BAV en AOV voordat inzet plaatsvindt.',
    }
  }
  if (!heeftBAV || !heeftAOV) {
    return {
      status: 'AANDACHT',
      toelichting: `Ontbrekend: ${!heeftBAV ? 'BAV' : ''}${!heeftBAV && !heeftAOV ? ' en ' : ''}${!heeftAOV ? 'AOV' : ''}. Financieel risico is gedeeltelijk aantoonbaar.`,
      mitigatie: 'Aanvullen met ontbrekende verzekering(en).',
    }
  }
  return {
    status: 'CONFORM',
    toelichting: 'Geldige BAV en AOV aanwezig. CZO draagt eigen financieel risico.',
  }
}

function beoordeelOndernemerschap(
  heeftKvK: boolean | null | undefined,
  heeftEigenTarief: boolean,
  alleenViaSamenOntzorgen: boolean,
  opdrachtgeversCount: number
): Pick<GezichtspuntBeoordeling, 'status' | 'toelichting' | 'mitigatie'> {
  const problemen: string[] = []
  if (!heeftKvK) problemen.push('geen KvK-inschrijving')
  if (!heeftEigenTarief) problemen.push('geen eigen tarief geregistreerd')
  if (alleenViaSamenOntzorgen) problemen.push('werkt uitsluitend via SamenOntzorgen (geen spreiding).')

  if (problemen.length >= 2) {
    return {
      status: 'RISICO',
      toelichting: `Ondernemerschap onvoldoende aantoonbaar: ${problemen.join(', ')}.`,
      mitigatie: 'KvK aantonen, eigen tarief vastleggen, actief andere opdrachtgevers zoeken.',
    }
  }
  if (problemen.length === 1) {
    return {
      status: 'AANDACHT',
      toelichting: `Aandachtspunt: ${problemen[0]}.`,
      mitigatie: 'Coachen op spreiding van opdrachtgevers.',
    }
  }
  return {
    status: 'CONFORM',
    toelichting: `Ondernemerschap aantoonbaar: KvK aanwezig, eigen tarief vastgelegd, werkt voor ${opdrachtgeversCount} instelling(en).`,
  }
}

function beoordeelEconomischeAfhankelijkheid(
  alleenViaSamenOntzorgen: boolean,
  opdrachtgeversCount: number
): Pick<GezichtspuntBeoordeling, 'status' | 'toelichting' | 'mitigatie'> {
  if (alleenViaSamenOntzorgen) {
    return {
      status: 'AANDACHT',
      toelichting: 'CZO werkt uitsluitend via SamenOntzorgen voor één instelling. Economische afhankelijkheid is een risicosignaal voor het Uber-toetskader.',
      mitigatie: 'Actief coachen om ook buiten SamenOntzorgen opdrachten te verwerven.',
    }
  }
  if (opdrachtgeversCount < 3) {
    return {
      status: 'AANDACHT',
      toelichting: `CZO werkt voor ${opdrachtgeversCount} instelling(en). Spreiding is beperkt maar aanwezig.`,
    }
  }
  return {
    status: 'CONFORM',
    toelichting: `CZO werkt voor ${opdrachtgeversCount} verschillende instellingen. Geen economische afhankelijkheid.`,
  }
}

// Gewogen totaalbeoordeling: één zwaar RISICO of twee zware AANDACHT → totaal RISICO.
// Eén zwaar AANDACHT of twee normale AANDACHT → totaal AANDACHT.
export function berekenTotaalStatus(gezichtspunten: GezichtspuntBeoordeling[]): VisueleStatus {
  const gewichtScore = (g: GezichtspuntBeoordeling): number => {
    const w = g.gewicht === 'ZWAAR' ? 3 : g.gewicht === 'NORMAAL' ? 1 : 0.5
    return w
  }

  let risicoGewicht = 0
  let aandachtGewicht = 0

  for (const g of gezichtspunten) {
    const w = gewichtScore(g)
    if (g.status === 'RISICO') risicoGewicht += w
    if (g.status === 'AANDACHT') aandachtGewicht += w
  }

  // Elk RISICO-item (ongeacht gewicht) → totaal RISICO
  if (risicoGewicht > 0) return 'RISICO'
  // NORMAAL of ZWAAR AANDACHT (gewicht >= 1) → totaal AANDACHT
  // LICHT alleen (0.5) telt niet: is sector-gebruikelijk en gedekt door andere factoren
  if (aandachtGewicht >= 1) return 'AANDACHT'
  return 'VEILIG'
}
