import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adapter } from '@/lib/adapters'
import { berekenAandachtspunten, berekenVisueleStatusVoorInstelling } from '@/lib/signalen'
import type { CZOSamenvatting, InstellingOverzicht } from '@/types'
import { berekenGezichtspunten } from '@/lib/gezichtspunten'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const { rol, zorginstellingId } = session.user

  // Beheerder ziet alle instellingen; instelling-gebruiker alleen de eigen
  if (rol === 'BEHEERDER') {
    const instellingen = await adapter.getAlleZorginstellingen()
    return NextResponse.json({ instellingen })
  }

  if (!zorginstellingId) {
    return NextResponse.json({ error: 'Geen instelling gekoppeld' }, { status: 403 })
  }

  const [zorginstelling, czos, opdrachtenInstelling, kwartaalaudits] = await Promise.all([
    adapter.getZorginstelling(zorginstellingId),
    adapter.getCZOsVoorInstelling(zorginstellingId),
    adapter.getOpdrachtenVoorInstelling(zorginstellingId),
    adapter.getKwartaalauditsVoorInstelling(zorginstellingId),
  ])

  if (!zorginstelling) return NextResponse.json({ error: 'Instelling niet gevonden' }, { status: 404 })

  // Bouw per-CZO datastructuren op
  const documentenPerCZO: Record<string, Awaited<ReturnType<typeof adapter.getDocumentenVoorCZO>>> = {}
  const opdrachtenPerCZO: Record<string, Awaited<ReturnType<typeof adapter.getOpdrachtenVoorCZO>>> = {}
  const opdrachtgeversCountPerCZO: Record<string, number> = {}

  await Promise.all(czos.map(async (czo) => {
    const [docs, opdrachten, count] = await Promise.all([
      adapter.getDocumentenVoorCZO(czo.id),
      adapter.getOpdrachtenVoorCZO(czo.id),
      adapter.getOpdrachtgeversCountVoorCZO(czo.id),
    ])
    documentenPerCZO[czo.id] = docs
    opdrachtenPerCZO[czo.id] = opdrachten
    opdrachtgeversCountPerCZO[czo.id] = count
  }))

  const aandachtspunten = berekenAandachtspunten({
    czos,
    documentenPerCZO,
    opdrachtenPerCZO,
    opdrachtgeversCountPerCZO,
    kwartaalaudits,
    zorginstellingId,
    zorginstellingNaam: zorginstelling.naam,
  })

  const czoSamenvattingen: CZOSamenvatting[] = czos.map((czo) => {
    const score = berekenGezichtspunten({
      czo,
      documenten: documentenPerCZO[czo.id] ?? [],
      opdrachten: opdrachtenPerCZO[czo.id] ?? [],
      opdrachtgeversCount: opdrachtgeversCountPerCZO[czo.id] ?? 1,
    })
    return {
      czo,
      visueleStatus: score.totaalStatus,
      aantalOpdrachten: (opdrachtenPerCZO[czo.id] ?? []).filter(
        (o) => o.zorginstellingId === zorginstellingId
      ).length,
      opdrachtgeversCount: opdrachtgeversCountPerCZO[czo.id] ?? 1,
    }
  })

  const aantalDocumentenGeldig = Object.values(documentenPerCZO)
    .flat()
    .filter((d) => d.status === 'GELDIG').length
  const aantalDocumentenTotaal = Object.values(documentenPerCZO).flat().length

  const overzicht: InstellingOverzicht = {
    zorginstelling,
    kwartaal: 'Q2/2026',
    visueleStatus: berekenVisueleStatusVoorInstelling(aandachtspunten),
    aantalActieveCzos: czos.length,
    aantalLopendOpdrachten: opdrachtenInstelling.filter((o) => !o.einddatum || new Date(o.einddatum) >= new Date()).length,
    aantalDocumentenGeldig,
    aantalDocumentenTotaal,
    eerstvolgendeAudit: kwartaalaudits.find((a) => a.status === 'CONCEPT') ?? null,
    czos: czoSamenvattingen,
    aandachtspunten,
  }

  // Log de inzage
  await adapter.registreerToegang({
    gebruikerId: session.user.id,
    gebruikerNaam: session.user.naam,
    actie: 'INZAGE_OVERZICHT',
    doelType: 'INSTELLING',
    doelId: zorginstellingId,
    doelNaam: zorginstelling.naam,
  })

  return NextResponse.json(overzicht)
}
