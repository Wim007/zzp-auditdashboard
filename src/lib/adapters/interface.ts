import type { CZO, Document, Kwartaalaudit, Opdracht, Toegangslog, Zorginstelling } from '@/types'

/**
 * Data-adapter interface: de rest van de app weet niet of data uit APM of de mock komt.
 * Alleen deze interface verandert bij de overgang naar de echte APM-koppeling.
 *
 * Verwerkersovereenkomst: SamenOntzorgen treedt op als verwerker voor de zorginstelling
 * (de verwerkingsverantwoordelijke). Bij productie moet een verwerkersovereenkomst getekend
 * zijn voor elke zorginstelling die via dit dashboard persoonsgegevens van CZO's inziet.
 */
export interface ApmAdapter {
  // Zorginstellingen
  getZorginstelling(id: string): Promise<Zorginstelling | null>
  getAlleZorginstellingen(): Promise<Zorginstelling[]>

  // CZO's
  getCZO(id: string): Promise<CZO | null>
  getCZOsVoorInstelling(zorginstellingId: string): Promise<CZO[]>
  getAlleCZOs(): Promise<CZO[]>

  // Opdrachten
  getOpdrachtenVoorCZO(czoId: string): Promise<Opdracht[]>
  getOpdrachtenVoorInstelling(zorginstellingId: string): Promise<Opdracht[]>
  getOpdrachtenVoorCZOEnInstelling(czoId: string, zorginstellingId: string): Promise<Opdracht[]>

  // Documenten
  getDocumentenVoorCZO(czoId: string): Promise<Document[]>

  // Kwartaalaudits
  getKwartaalauditsVoorInstelling(zorginstellingId: string): Promise<Kwartaalaudit[]>

  // Aantal unieke opdrachtgevers per CZO (voor ondernemerschapsbeoordeling)
  getOpdrachtgeversCountVoorCZO(czoId: string): Promise<number>

  // Toegangslog
  registreerToegang(log: Omit<Toegangslog, 'id' | 'tijdstip'>): Promise<void>
  getToegangslogsVoorBeheerder(limit?: number): Promise<Toegangslog[]>
  getToegangslogsVoorInstelling(zorginstellingId: string): Promise<Toegangslog[]>
}
