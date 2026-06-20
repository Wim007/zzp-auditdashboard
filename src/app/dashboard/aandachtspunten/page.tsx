import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adapter } from '@/lib/adapters'
import { berekenAandachtspunten } from '@/lib/signalen'
import { Navigatie } from '@/components/ui/Navigatie'
import type { Aandachtspunt } from '@/types'

const typeLabels: Record<Aandachtspunt['type'], string> = {
  ROOSTERVERVANGING: 'Roostervervanging-signaal',
  WEINIG_OPDRACHTGEVERS: 'Spreiding opdrachtgevers',
  AUDIT_OPENSTAAND: 'Kwartaalaudit openstaand',
  DOCUMENT_AANDACHT: 'Document aandacht',
  GEEN_ONDERNEMERSDOSSIER: 'Ontbrekend ondernemersdossier',
}

export default async function AandachtspuntenPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.rol === 'BEHEERDER') redirect('/beheer')

  const { zorginstellingId, naam } = session.user
  if (!zorginstellingId) redirect('/login')

  const [zorginstelling, czos, kwartaalaudits] = await Promise.all([
    adapter.getZorginstelling(zorginstellingId),
    adapter.getCZOsVoorInstelling(zorginstellingId),
    adapter.getKwartaalauditsVoorInstelling(zorginstellingId),
  ])
  if (!zorginstelling) redirect('/login')

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
    czos, documentenPerCZO, opdrachtenPerCZO, opdrachtgeversCountPerCZO,
    kwartaalaudits, zorginstellingId, zorginstellingNaam: zorginstelling.naam,
  })

  const open = aandachtspunten.filter(a => a.status === 'OPEN')
  const risico = open.filter(a => a.ernst === 'RISICO')
  const aandacht = open.filter(a => a.ernst === 'AANDACHT')

  return (
    <div className="min-h-screen">
      <Navigatie rol={session.user.rol} naam={naam} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Aandachtspunten</h1>
        <p className="text-sm text-gray-500 mb-6">{zorginstelling.naam}</p>

        {open.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-medium">Geen openstaande aandachtspunten</p>
            <p className="text-sm text-green-600 mt-1">Alle CZO's zijn volledig compliant.</p>
          </div>
        )}

        {risico.length > 0 && (
          <Groep titel="Risico" punten={risico} kleur="red" />
        )}
        {aandacht.length > 0 && (
          <Groep titel="Aandacht" punten={aandacht} kleur="amber" />
        )}
      </main>
    </div>
  )
}

function Groep({ titel, punten, kleur }: { titel: string; punten: Aandachtspunt[]; kleur: 'red' | 'amber' }) {
  const bg = kleur === 'red' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
  const text = kleur === 'red' ? 'text-red-900' : 'text-amber-900'
  const subtext = kleur === 'red' ? 'text-red-700' : 'text-amber-700'

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">{titel}</h2>
      <div className="space-y-3">
        {punten.map((p) => (
          <div key={p.id} className={`border rounded-xl p-4 ${bg}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${subtext}`}>
                  {typeLabels[p.type] ?? p.type}
                </p>
                <p className={`text-sm font-medium ${text}`}>{p.omschrijving}</p>
                {p.czoNaam && (
                  <p className="text-xs text-gray-500 mt-1">CZO: {p.czoNaam}</p>
                )}
              </div>
              {p.czoId && (
                <a
                  href={`/dashboard/czo/${p.czoId}`}
                  className="flex-shrink-0 text-xs bg-white border border-current px-2 py-1 rounded-md hover:bg-opacity-80 transition-colors"
                >
                  Dossier
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
