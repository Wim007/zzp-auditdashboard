import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { adapter } from '@/lib/adapters'
import { instellingMagCZOZien } from '@/lib/scoping'
import { berekenGezichtspunten } from '@/lib/gezichtspunten'
import { genereerBewijspakketPDF } from '@/lib/pdf'
import type { BewijspakketVariant, CZODossier } from '@/types'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.json() as { czoIds?: string[]; variant?: BewijspakketVariant }
  const { czoIds, variant = 'VOLLEDIG' } = body
  const { rol, zorginstellingId } = session.user

  if (!zorginstellingId && rol !== 'BEHEERDER') {
    return NextResponse.json({ error: 'Geen instelling' }, { status: 403 })
  }

  const instellingId = rol === 'BEHEERDER' ? (zorginstellingId ?? 'inst-linden') : zorginstellingId!
  const zorginstelling = await adapter.getZorginstelling(instellingId)
  if (!zorginstelling) return NextResponse.json({ error: 'Instelling niet gevonden' }, { status: 404 })

  const beschikbareCzos = await adapter.getCZOsVoorInstelling(instellingId)
  const teGenereren = czoIds
    ? beschikbareCzos.filter((c) => czoIds.includes(c.id))
    : beschikbareCzos

  const dossiers: CZODossier[] = []

  for (const czo of teGenereren) {
    const [documenten, opdrachten, opdrachtgeversCount] = await Promise.all([
      adapter.getDocumentenVoorCZO(czo.id),
      adapter.getOpdrachtenVoorCZO(czo.id),
      adapter.getOpdrachtgeversCountVoorCZO(czo.id),
    ])

    // Scoping check
    if (rol === 'INSTELLING_GEBRUIKER') {
      if (!instellingMagCZOZien(instellingId, opdrachten)) continue
    }

    const gezichtspuntenScore = berekenGezichtspunten({ czo, documenten, opdrachten, opdrachtgeversCount })

    dossiers.push({
      czo,
      documenten,
      opdrachten,
      opdrachtgeversCount,
      alleenViaSamenOntzorgen: opdrachtgeversCount <= 1,
      visueleStatus: gezichtspuntenScore.totaalStatus,
      gezichtspuntenScore,
    })
  }

  if (dossiers.length === 0) {
    return NextResponse.json({ error: 'Geen CZOs beschikbaar' }, { status: 404 })
  }

  const pdfBuffer = await genereerBewijspakketPDF({
    zorginstelling,
    dossiers,
    variant,
    generatorNaam: session.user.naam,
  })

  // Log de generatie
  await adapter.registreerToegang({
    gebruikerId: session.user.id,
    gebruikerNaam: session.user.naam,
    actie: `BEWIJSPAKKET_${variant}`,
    doelType: 'INSTELLING',
    doelId: instellingId,
    doelNaam: zorginstelling.naam,
    metadata: { aantalCzos: dossiers.length, variant },
  })

  const datum = new Date().toISOString().split('T')[0]
  const bestandsnaam = `bewijspakket-${variant.toLowerCase()}-${datum}.pdf`

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${bestandsnaam}"`,
    },
  })
}
