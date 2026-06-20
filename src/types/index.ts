export type CZOStatus = 'ACTIEF' | 'HOLD'
export type DocumentType = 'DIPLOMA' | 'BIG' | 'VOG' | 'BAV' | 'AOV' | 'WKKGZ' | 'SCHOLING' | 'KVK'
export type DocumentStatus = 'GELDIG' | 'AANDACHT' | 'ONTBREEKT'
export type AuditStatus = 'CONCEPT' | 'GETEKEND'
export type Rol = 'INSTELLING_GEBRUIKER' | 'BEHEERDER'

export type VisueleStatus = 'VEILIG' | 'AANDACHT' | 'RISICO'

export interface Zorginstelling {
  id: string
  naam: string
  contactEmail?: string | null
  contactTelefoon?: string | null
  adres?: string | null
}

export interface CZO {
  id: string
  naam: string
  bedrijfsnaam?: string | null
  bigNummer?: string | null
  kvkNummer?: string | null
  status: CZOStatus
  eigenTarief?: number | null
  functie?: string | null
  email?: string | null
  telefoon?: string | null
}

export interface Opdracht {
  id: string
  czoId: string
  zorginstellingId: string
  zorginstellingNaam?: string
  startdatum: string
  einddatum?: string | null
  afdeling?: string | null
  locatie?: string | null
  omschrijving?: string | null
}

export interface Document {
  id: string
  czoId: string
  type: DocumentType
  status: DocumentStatus
  omschrijving?: string | null
  afgiftedatum?: string | null
  vervaldatum?: string | null
  bestandsverwijzing?: string | null
}

export interface Kwartaalaudit {
  id: string
  zorginstellingId: string
  kwartaal: string
  status: AuditStatus
  datum?: string | null
  notities?: string | null
}

export interface Gebruiker {
  id: string
  email: string
  naam: string
  rol: Rol
  zorginstellingId?: string | null
}

export interface Toegangslog {
  id: string
  gebruikerId: string
  gebruikerNaam?: string
  actie: string
  doelType: string
  doelId: string
  doelNaam?: string | null
  tijdstip: string
  metadata?: Record<string, unknown> | null
}

// Samengestelde types voor de UI

export interface CZODossier {
  czo: CZO
  documenten: Document[]
  opdrachten: Opdracht[]
  opdrachtgeversCount: number
  alleenViaSamenOntzorgen: boolean
  visueleStatus: VisueleStatus
  gezichtspuntenScore: GezichtspuntenScore
}

export interface GezichtspuntBeoordeling {
  id: string
  naam: string
  omschrijving: string
  gewicht: 'ZWAAR' | 'NORMAAL' | 'LICHT'
  status: 'CONFORM' | 'AANDACHT' | 'RISICO'
  toelichting?: string
  mitigatie?: string
}

export interface GezichtspuntenScore {
  gezichtspunten: GezichtspuntBeoordeling[]
  totaalStatus: VisueleStatus
}

export interface Aandachtspunt {
  id: string
  type: 'ROOSTERVERVANGING' | 'ALLEEN_VIA_SO' | 'AUDIT_OPENSTAAND' | 'DOCUMENT_AANDACHT' | 'GEEN_ONDERNEMERSDOSSIER'
  czoId?: string
  czoNaam?: string
  zorginstellingId?: string
  zorginstellingNaam?: string
  omschrijving: string
  status: 'OPEN' | 'IN_BEHANDELING' | 'OPGELOST'
  ernst: VisueleStatus
}

export interface InstellingOverzicht {
  zorginstelling: Zorginstelling
  kwartaal: string
  visueleStatus: VisueleStatus
  aantalActieveCzos: number
  aantalLopendOpdrachten: number
  aantalDocumentenGeldig: number
  aantalDocumentenTotaal: number
  eerstvolgendeAudit?: Kwartaalaudit | null
  czos: CZOSamenvatting[]
  aandachtspunten: Aandachtspunt[]
}

export interface CZOSamenvatting {
  czo: CZO
  visueleStatus: VisueleStatus
  aantalOpdrachten: number
  alleenViaSamenOntzorgen: boolean
}

export type BewijspakketVariant = 'DBA' | 'KWALITEIT' | 'VOLLEDIG'
