import type { ApmAdapter } from './interface'
import type { CZO, Document, Kwartaalaudit, Opdracht, Toegangslog, Zorginstelling } from '@/types'

/**
 * APM-adapter — productie-implementatie.
 * TODO: vervang elke methode door de echte APM-API aanroep of database-import.
 *
 * APM (Actief Software) is de bron van waarheid. Zodra de exacte API-vorm bekend is
 * (REST, export, webhook), implementeer je hier de koppeling zonder de rest van de app
 * te raken.
 */
export const apmAdapter: ApmAdapter = {
  async getZorginstelling(_id): Promise<Zorginstelling | null> {
    // TODO: GET /api/instellingen/{id} op APM
    throw new Error('APM-adapter: getZorginstelling nog niet geïmplementeerd')
  },

  async getAlleZorginstellingen(): Promise<Zorginstelling[]> {
    // TODO: GET /api/instellingen op APM
    throw new Error('APM-adapter: getAlleZorginstellingen nog niet geïmplementeerd')
  },

  async getCZO(_id): Promise<CZO | null> {
    // TODO: GET /api/czos/{id} op APM
    throw new Error('APM-adapter: getCZO nog niet geïmplementeerd')
  },

  async getCZOsVoorInstelling(_zorginstellingId): Promise<CZO[]> {
    // TODO: GET /api/instellingen/{id}/czos op APM
    throw new Error('APM-adapter: getCZOsVoorInstelling nog niet geïmplementeerd')
  },

  async getAlleCZOs(): Promise<CZO[]> {
    // TODO: GET /api/czos op APM
    throw new Error('APM-adapter: getAlleCZOs nog niet geïmplementeerd')
  },

  async getOpdrachtenVoorCZO(_czoId): Promise<Opdracht[]> {
    // TODO: GET /api/czos/{id}/opdrachten op APM
    throw new Error('APM-adapter: getOpdrachtenVoorCZO nog niet geïmplementeerd')
  },

  async getOpdrachtenVoorInstelling(_zorginstellingId): Promise<Opdracht[]> {
    // TODO: GET /api/instellingen/{id}/opdrachten op APM
    throw new Error('APM-adapter: getOpdrachtenVoorInstelling nog niet geïmplementeerd')
  },

  async getOpdrachtenVoorCZOEnInstelling(_czoId, _zorginstellingId): Promise<Opdracht[]> {
    throw new Error('APM-adapter: getOpdrachtenVoorCZOEnInstelling nog niet geïmplementeerd')
  },

  async getDocumentenVoorCZO(_czoId): Promise<Document[]> {
    // TODO: GET /api/czos/{id}/documenten op APM
    throw new Error('APM-adapter: getDocumentenVoorCZO nog niet geïmplementeerd')
  },

  async getKwartaalauditsVoorInstelling(_zorginstellingId): Promise<Kwartaalaudit[]> {
    throw new Error('APM-adapter: getKwartaalauditsVoorInstelling nog niet geïmplementeerd')
  },

  async getOpdrachtgeversCountVoorCZO(_czoId): Promise<number> {
    throw new Error('APM-adapter: getOpdrachtgeversCountVoorCZO nog niet geïmplementeerd')
  },

  async registreerToegang(_log): Promise<void> {
    // TODO: schrijf naar audit-log in database
    throw new Error('APM-adapter: registreerToegang nog niet geïmplementeerd')
  },

  async getToegangslogsVoorBeheerder(_limit): Promise<Toegangslog[]> {
    throw new Error('APM-adapter: getToegangslogsVoorBeheerder nog niet geïmplementeerd')
  },

  async getToegangslogsVoorInstelling(_zorginstellingId): Promise<Toegangslog[]> {
    throw new Error('APM-adapter: getToegangslogsVoorInstelling nog niet geïmplementeerd')
  },
}
