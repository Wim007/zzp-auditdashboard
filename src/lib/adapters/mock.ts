import type { ApmAdapter } from './interface'
import type { CZO, Document, Kwartaalaudit, Opdracht, Toegangslog, Zorginstelling } from '@/types'

// ─── Seed-data (§10 van de bouwopdracht) ───────────────────────────────────

const LINDEN_ID = 'inst-linden'
const ANDERE_ID = 'inst-andere'

const zorginstellingen: Zorginstelling[] = [
  {
    id: LINDEN_ID,
    naam: 'Thuiszorg De Linden B.V.',
    contactEmail: 'zorginkoop@delinden.nl',
    contactTelefoon: '020-1234567',
    adres: 'Lindenstraat 12, 1234 AB Amsterdam',
  },
  {
    id: ANDERE_ID,
    naam: 'Zorggroep Noord B.V.',
    contactEmail: 'inkoop@zorggroepnoord.nl',
    contactTelefoon: '030-9876543',
    adres: 'Noordplein 5, 3500 CD Utrecht',
  },
]

const czos: CZO[] = [
  {
    id: 'czo-1',
    naam: 'Fatima Youssef',
    bigNummer: '19001234501',
    kvkNummer: '87654321',
    status: 'ACTIEF',
    eigenTarief: 48,
    functie: 'Verzorgende IG niveau 3',
    email: 'f.youssef@zzpzorg.nl',
  },
  {
    id: 'czo-2',
    naam: 'Jan de Vries',
    bigNummer: '29002345602',
    kvkNummer: '76543210',
    status: 'ACTIEF',
    eigenTarief: 52,
    functie: 'Verzorgende IG niveau 3',
    email: 'j.devries@zzpzorg.nl',
  },
  {
    id: 'czo-3',
    naam: 'Miriam Bakker',
    bigNummer: '39003456703',
    kvkNummer: '65432109',
    status: 'ACTIEF',
    eigenTarief: 41,
    functie: 'Helpende niveau 2',
    email: 'm.bakker@zzpzorg.nl',
  },
  {
    id: 'czo-4',
    naam: 'Ahmed Khalil',
    bigNummer: '49004567804',
    kvkNummer: '54321098',
    status: 'ACTIEF',
    eigenTarief: 63,
    functie: 'Verpleegkundige niveau 5',
    email: 'a.khalil@zzpzorg.nl',
  },
  {
    id: 'czo-5',
    naam: 'Sandra Hoek',
    bigNummer: '59005678905',
    kvkNummer: null, // aandachtspunt: geen KvK
    status: 'ACTIEF',
    eigenTarief: 45,
    functie: 'Verzorgende IG niveau 3',
    email: 's.hoek@zzpzorg.nl',
  },
  {
    id: 'czo-6',
    naam: 'Peter Smits',
    bigNummer: '69006789006',
    kvkNummer: '43210987',
    status: 'ACTIEF',
    eigenTarief: 47,
    functie: 'Verzorgende IG niveau 3',
    email: 'p.smits@zzpzorg.nl',
  },
]

// ─── Opdrachten ─────────────────────────────────────────────────────────────
// Minimaal 1 opdracht > 8 weken aaneengesloten (triggert roostervervanging-signaal)
// 2 CZOs hebben ook opdrachten bij de andere instelling (czo-1, czo-4)

const nu = new Date()
const datumRelatiefAan = (dagOffset: number) => {
  const d = new Date(nu)
  d.setDate(d.getDate() + dagOffset)
  return d.toISOString().split('T')[0]
}

const opdrachten: Opdracht[] = [
  // czo-1: Linden + Andere instelling → verspreid
  {
    id: 'opd-1',
    czoId: 'czo-1',
    zorginstellingId: LINDEN_ID,
    zorginstellingNaam: 'Thuiszorg De Linden B.V.',
    startdatum: datumRelatiefAan(-30),
    einddatum: datumRelatiefAan(30),
    afdeling: 'Wijk Oost',
    omschrijving: 'Persoonlijke verzorging',
  },
  {
    id: 'opd-2',
    czoId: 'czo-1',
    zorginstellingId: ANDERE_ID,
    zorginstellingNaam: 'Zorggroep Noord B.V.',
    startdatum: datumRelatiefAan(-60),
    einddatum: datumRelatiefAan(-35),
    afdeling: 'Afdeling A',
    omschrijving: 'Nachtdiensten',
  },
  // czo-2: uitsluitend Linden (alleen-via-SO)
  {
    id: 'opd-3',
    czoId: 'czo-2',
    zorginstellingId: LINDEN_ID,
    zorginstellingNaam: 'Thuiszorg De Linden B.V.',
    startdatum: datumRelatiefAan(-20),
    einddatum: datumRelatiefAan(40),
    afdeling: 'Wijk West',
    omschrijving: 'Huishoudelijke hulp plus',
  },
  // czo-3: uitsluitend Linden + LANG (>8 weken = roostervervanging-signaal!)
  {
    id: 'opd-4',
    czoId: 'czo-3',
    zorginstellingId: LINDEN_ID,
    zorginstellingNaam: 'Thuiszorg De Linden B.V.',
    startdatum: datumRelatiefAan(-70), // 70 dagen geleden = ~10 weken
    einddatum: datumRelatiefAan(10),
    afdeling: 'Afdeling B - Dementie',
    omschrijving: 'Dagactiviteiten begeleiding',
  },
  // czo-4: Linden + Andere instelling → verspreid
  {
    id: 'opd-5',
    czoId: 'czo-4',
    zorginstellingId: LINDEN_ID,
    zorginstellingNaam: 'Thuiszorg De Linden B.V.',
    startdatum: datumRelatiefAan(-14),
    einddatum: datumRelatiefAan(60),
    afdeling: 'Wijk Centrum',
    omschrijving: 'Verpleegkundige handelingen',
  },
  {
    id: 'opd-6',
    czoId: 'czo-4',
    zorginstellingId: ANDERE_ID,
    zorginstellingNaam: 'Zorggroep Noord B.V.',
    startdatum: datumRelatiefAan(-90),
    einddatum: datumRelatiefAan(-20),
    afdeling: 'Revalidatie',
    omschrijving: 'Wondverzorging',
  },
  // czo-5: uitsluitend Linden (alleen-via-SO)
  {
    id: 'opd-7',
    czoId: 'czo-5',
    zorginstellingId: LINDEN_ID,
    zorginstellingNaam: 'Thuiszorg De Linden B.V.',
    startdatum: datumRelatiefAan(-10),
    einddatum: datumRelatiefAan(50),
    afdeling: 'Wijk Zuid',
    omschrijving: 'Persoonlijke verzorging',
  },
  // czo-6: uitsluitend Linden (alleen-via-SO)
  {
    id: 'opd-8',
    czoId: 'czo-6',
    zorginstellingId: LINDEN_ID,
    zorginstellingNaam: 'Thuiszorg De Linden B.V.',
    startdatum: datumRelatiefAan(-5),
    einddatum: datumRelatiefAan(55),
    afdeling: 'Wijk Noord',
    omschrijving: 'Avondzorg',
  },
]

// ─── Documenten ──────────────────────────────────────────────────────────────

const documenten: Document[] = [
  // czo-1: volledig dossier
  { id: 'd1-1', czoId: 'czo-1', type: 'DIPLOMA', status: 'GELDIG', omschrijving: 'MBO Verpleegkunde niveau 3', afgiftedatum: '2018-06-15', vervaldatum: null },
  { id: 'd1-2', czoId: 'czo-1', type: 'BIG', status: 'GELDIG', omschrijving: 'BIG-registratie verpleegkundige', afgiftedatum: '2022-03-01', vervaldatum: '2027-03-01' },
  { id: 'd1-3', czoId: 'czo-1', type: 'VOG', status: 'GELDIG', omschrijving: 'VOG screeningsprofiel Zorg', afgiftedatum: '2024-01-10', vervaldatum: '2026-01-10' },
  { id: 'd1-4', czoId: 'czo-1', type: 'BAV', status: 'GELDIG', omschrijving: 'Beroepsaansprakelijkheidsverzekering', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd1-5', czoId: 'czo-1', type: 'AOV', status: 'GELDIG', omschrijving: 'Arbeidsongeschiktheidsverzekering', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd1-6', czoId: 'czo-1', type: 'WKKGZ', status: 'GELDIG', omschrijving: 'Aansluiting Klachtenportaal Zorg', afgiftedatum: '2023-06-01', vervaldatum: null },
  { id: 'd1-7', czoId: 'czo-1', type: 'KVK', status: 'GELDIG', omschrijving: 'KvK-uittreksel', afgiftedatum: '2024-05-01', vervaldatum: null },
  { id: 'd1-8', czoId: 'czo-1', type: 'SCHOLING', status: 'GELDIG', omschrijving: 'BHV-certificaat', afgiftedatum: '2024-03-15', vervaldatum: '2026-03-15' },

  // czo-2: volledig dossier
  { id: 'd2-1', czoId: 'czo-2', type: 'DIPLOMA', status: 'GELDIG', omschrijving: 'MBO Verzorgende IG niveau 3', afgiftedatum: '2015-06-20' },
  { id: 'd2-2', czoId: 'czo-2', type: 'BIG', status: 'GELDIG', omschrijving: 'BIG-registratie', afgiftedatum: '2021-09-01', vervaldatum: '2026-09-01' },
  { id: 'd2-3', czoId: 'czo-2', type: 'VOG', status: 'GELDIG', omschrijving: 'VOG screeningsprofiel Zorg', afgiftedatum: '2023-11-01', vervaldatum: '2025-11-01' },
  { id: 'd2-4', czoId: 'czo-2', type: 'BAV', status: 'GELDIG', omschrijving: 'BAV Centraal Beheer', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd2-5', czoId: 'czo-2', type: 'AOV', status: 'GELDIG', omschrijving: 'AOV Zorgpolis', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd2-6', czoId: 'czo-2', type: 'WKKGZ', status: 'GELDIG', omschrijving: 'Aansluiting SKJ', afgiftedatum: '2023-01-01' },
  { id: 'd2-7', czoId: 'czo-2', type: 'KVK', status: 'GELDIG', omschrijving: 'KvK-uittreksel', afgiftedatum: '2024-04-01' },
  { id: 'd2-8', czoId: 'czo-2', type: 'SCHOLING', status: 'GELDIG', omschrijving: 'Medicatieveiligheid', afgiftedatum: '2024-02-10', vervaldatum: '2026-02-10' },

  // czo-3: bijna volledig maar BAV verloopt binnenkort (AANDACHT)
  { id: 'd3-1', czoId: 'czo-3', type: 'DIPLOMA', status: 'GELDIG', omschrijving: 'Helpende Welzijn niveau 2', afgiftedatum: '2019-06-15' },
  { id: 'd3-2', czoId: 'czo-3', type: 'BIG', status: 'GELDIG', omschrijving: 'BIG-registratie', afgiftedatum: '2020-06-01', vervaldatum: '2025-06-01' },
  { id: 'd3-3', czoId: 'czo-3', type: 'VOG', status: 'GELDIG', omschrijving: 'VOG screeningsprofiel Zorg', afgiftedatum: '2024-02-01', vervaldatum: '2026-02-01' },
  { id: 'd3-4', czoId: 'czo-3', type: 'BAV', status: 'AANDACHT', omschrijving: 'BAV loopt binnenkort af', afgiftedatum: '2023-07-01', vervaldatum: '2025-07-15' },
  { id: 'd3-5', czoId: 'czo-3', type: 'AOV', status: 'GELDIG', omschrijving: 'AOV', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd3-6', czoId: 'czo-3', type: 'WKKGZ', status: 'GELDIG', omschrijving: 'Klachtenportaal Zorg', afgiftedatum: '2023-01-01' },
  { id: 'd3-7', czoId: 'czo-3', type: 'KVK', status: 'GELDIG', omschrijving: 'KvK-uittreksel', afgiftedatum: '2024-03-01' },
  { id: 'd3-8', czoId: 'czo-3', type: 'SCHOLING', status: 'GELDIG', omschrijving: 'Hygiëne en infectiepreventie', afgiftedatum: '2024-01-15', vervaldatum: '2026-01-15' },

  // czo-4: volledig dossier (verpleegkundige niveau 5)
  { id: 'd4-1', czoId: 'czo-4', type: 'DIPLOMA', status: 'GELDIG', omschrijving: 'HBO Verpleegkunde niveau 5', afgiftedatum: '2016-06-30' },
  { id: 'd4-2', czoId: 'czo-4', type: 'BIG', status: 'GELDIG', omschrijving: 'BIG-registratie verpleegkundige', afgiftedatum: '2022-01-01', vervaldatum: '2027-01-01' },
  { id: 'd4-3', czoId: 'czo-4', type: 'VOG', status: 'GELDIG', omschrijving: 'VOG screeningsprofiel Zorg', afgiftedatum: '2024-03-01', vervaldatum: '2026-03-01' },
  { id: 'd4-4', czoId: 'czo-4', type: 'BAV', status: 'GELDIG', omschrijving: 'BAV Beroepsaansprakelijkheid', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd4-5', czoId: 'czo-4', type: 'AOV', status: 'GELDIG', omschrijving: 'AOV compleet', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd4-6', czoId: 'czo-4', type: 'WKKGZ', status: 'GELDIG', omschrijving: 'Geschilleninstantie Zorg', afgiftedatum: '2023-06-01' },
  { id: 'd4-7', czoId: 'czo-4', type: 'KVK', status: 'GELDIG', omschrijving: 'KvK-uittreksel', afgiftedatum: '2024-05-01' },
  { id: 'd4-8', czoId: 'czo-4', type: 'SCHOLING', status: 'GELDIG', omschrijving: 'Wondverzorging gevorderd', afgiftedatum: '2024-04-01', vervaldatum: '2026-04-01' },

  // czo-5: ontbreekt KvK (op CZO-niveau) + geen AOV (aandachtspunt)
  { id: 'd5-1', czoId: 'czo-5', type: 'DIPLOMA', status: 'GELDIG', omschrijving: 'MBO Verzorgende IG niveau 3', afgiftedatum: '2017-06-15' },
  { id: 'd5-2', czoId: 'czo-5', type: 'BIG', status: 'GELDIG', omschrijving: 'BIG-registratie', afgiftedatum: '2021-05-01', vervaldatum: '2026-05-01' },
  { id: 'd5-3', czoId: 'czo-5', type: 'VOG', status: 'GELDIG', omschrijving: 'VOG screeningsprofiel Zorg', afgiftedatum: '2024-01-01', vervaldatum: '2026-01-01' },
  { id: 'd5-4', czoId: 'czo-5', type: 'BAV', status: 'GELDIG', omschrijving: 'BAV aanwezig', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd5-5', czoId: 'czo-5', type: 'AOV', status: 'ONTBREEKT', omschrijving: 'AOV niet geregistreerd' },
  { id: 'd5-6', czoId: 'czo-5', type: 'WKKGZ', status: 'GELDIG', omschrijving: 'Klachtenportaal Zorg', afgiftedatum: '2023-01-01' },
  // KVK ontbreekt (ook geen kvkNummer op CZO-object)

  // czo-6: volledig dossier
  { id: 'd6-1', czoId: 'czo-6', type: 'DIPLOMA', status: 'GELDIG', omschrijving: 'MBO Verzorgende IG niveau 3', afgiftedatum: '2014-06-15' },
  { id: 'd6-2', czoId: 'czo-6', type: 'BIG', status: 'GELDIG', omschrijving: 'BIG-registratie', afgiftedatum: '2020-08-01', vervaldatum: '2025-08-01' },
  { id: 'd6-3', czoId: 'czo-6', type: 'VOG', status: 'GELDIG', omschrijving: 'VOG screeningsprofiel Zorg', afgiftedatum: '2023-09-01', vervaldatum: '2025-09-01' },
  { id: 'd6-4', czoId: 'czo-6', type: 'BAV', status: 'GELDIG', omschrijving: 'BAV', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd6-5', czoId: 'czo-6', type: 'AOV', status: 'GELDIG', omschrijving: 'AOV', afgiftedatum: '2024-01-01', vervaldatum: '2025-01-01' },
  { id: 'd6-6', czoId: 'czo-6', type: 'WKKGZ', status: 'GELDIG', omschrijving: 'Klachtenportaal Zorg', afgiftedatum: '2023-01-01' },
  { id: 'd6-7', czoId: 'czo-6', type: 'KVK', status: 'GELDIG', omschrijving: 'KvK-uittreksel', afgiftedatum: '2024-02-01' },
  { id: 'd6-8', czoId: 'czo-6', type: 'SCHOLING', status: 'GELDIG', omschrijving: 'Valpreventie', afgiftedatum: '2024-01-10', vervaldatum: '2026-01-10' },
]

const kwartaalaudits: Kwartaalaudit[] = [
  {
    id: 'audit-1',
    zorginstellingId: LINDEN_ID,
    kwartaal: 'Q2/2026',
    status: 'CONCEPT',
    datum: null,
    notities: 'Kwartaalaudit Q2/2026 — nog te tekenen door zorginkoper',
  },
  {
    id: 'audit-2',
    zorginstellingId: LINDEN_ID,
    kwartaal: 'Q1/2026',
    status: 'GETEKEND',
    datum: '2026-04-05',
    notities: 'Akkoord bevonden',
  },
]

// Toegangslogs (beginnen leeg, worden aangevuld bij gebruik)
let toegangslogs: Toegangslog[] = []
let logTeller = 0

// ─── Helper ─────────────────────────────────────────────────────────────────

function opdrachtgeversCountVoorCZO(czoId: string): number {
  const uniek = new Set(
    opdrachten
      .filter((o) => o.czoId === czoId)
      .map((o) => o.zorginstellingId)
  )
  return uniek.size
}

// ─── Mock-adapter implementatie ──────────────────────────────────────────────

export const mockAdapter: ApmAdapter = {
  async getZorginstelling(id) {
    return zorginstellingen.find((z) => z.id === id) ?? null
  },

  async getAlleZorginstellingen() {
    return zorginstellingen
  },

  async getCZO(id) {
    return czos.find((c) => c.id === id) ?? null
  },

  async getCZOsVoorInstelling(zorginstellingId) {
    const czoIds = new Set(
      opdrachten
        .filter((o) => o.zorginstellingId === zorginstellingId)
        .map((o) => o.czoId)
    )
    return czos.filter((c) => czoIds.has(c.id))
  },

  async getAlleCZOs() {
    return czos
  },

  async getOpdrachtenVoorCZO(czoId) {
    return opdrachten.filter((o) => o.czoId === czoId)
  },

  async getOpdrachtenVoorInstelling(zorginstellingId) {
    return opdrachten.filter((o) => o.zorginstellingId === zorginstellingId)
  },

  async getOpdrachtenVoorCZOEnInstelling(czoId, zorginstellingId) {
    return opdrachten.filter(
      (o) => o.czoId === czoId && o.zorginstellingId === zorginstellingId
    )
  },

  async getDocumentenVoorCZO(czoId) {
    return documenten.filter((d) => d.czoId === czoId)
  },

  async getKwartaalauditsVoorInstelling(zorginstellingId) {
    return kwartaalaudits.filter((a) => a.zorginstellingId === zorginstellingId)
  },

  async getOpdrachtgeversCountVoorCZO(czoId) {
    return opdrachtgeversCountVoorCZO(czoId)
  },

  async registreerToegang(log) {
    logTeller++
    toegangslogs.unshift({
      ...log,
      id: `log-${logTeller}`,
      tijdstip: new Date().toISOString(),
    })
  },

  async getToegangslogsVoorBeheerder(limit = 100) {
    return toegangslogs.slice(0, limit)
  },

  async getToegangslogsVoorInstelling(zorginstellingId) {
    return toegangslogs.filter(
      (l) => l.doelType === 'INSTELLING' && l.doelId === zorginstellingId
    )
  },
}
