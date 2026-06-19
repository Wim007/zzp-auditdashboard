import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adapter } from '@/lib/adapters'
import { instellingMagCZOZien } from '@/lib/scoping'
import { berekenGezichtspunten } from '@/lib/gezichtspunten'
import type { CZODossier } from '@/types'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const czoId = params.id
  const { rol, zorginstellingId } = session.user

  const [czo, documenten, opdrachten, opdrachtgeversCount] = await Promise.all([
    adapter.getCZO(czoId),
    adapter.getDocumentenVoorCZO(czoId),
    adapter.getOpdrachtenVoorCZO(czoId),
    adapter.getOpdrachtgeversCountVoorCZO(czoId),
  ])

  if (!czo) return NextResponse.json({ error: 'CZO niet gevonden' }, { status: 404 })

  // Scoping: instelling-gebruiker mag alleen CZO's zien waarmee zij een opdracht heeft.
  // Dit wordt afgedwongen op API-niveau.
  if (rol === 'INSTELLING_GEBRUIKER') {
    if (!zorginstellingId) return NextResponse.json({ error: 'Geen instelling' }, { status: 403 })
    const magZien = instellingMagCZOZien(zorginstellingId, opdrachten)
    if (!magZien) return NextResponse.json({ error: 'Toegang geweigerd' }, { status: 403 })
  }

  const gezichtspuntenScore = berekenGezichtspunten({ czo, documenten, opdrachten, opdrachtgeversCount })

  const dossier: CZODossier = {
    czo,
    documenten,
    opdrachten,
    opdrachtgeversCount,
    alleenViaSamenOntzorgen: opdrachtgeversCount <= 1,
    visueleStatus: gezichtspuntenScore.totaalStatus,
    gezichtspuntenScore,
  }

  // Log de inzage (VOG is bijzonder persoonsgegeven — extra flagging in metadata)
  const heeftVOG = documenten.some((d) => d.type === 'VOG')
  await adapter.registreerToegang({
    gebruikerId: session.user.id,
    gebruikerNaam: session.user.naam,
    actie: 'INZAGE_DOSSIER',
    doelType: 'CZO',
    doelId: czoId,
    doelNaam: czo.naam,
    metadata: { heeftVOGInzage: heeftVOG },
  })

  return NextResponse.json(dossier)
}
