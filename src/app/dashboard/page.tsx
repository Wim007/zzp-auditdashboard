import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adapter } from '@/lib/adapters'
import { berekenAandachtspunten, berekenVisueleStatusVoorInstelling } from '@/lib/signalen'
import { berekenGezichtspunten } from '@/lib/gezichtspunten'
import { Navigatie } from '@/components/ui/Navigatie'
import { StatusBadge, StatusStip } from '@/components/ui/StatusBadge'
import { BewijspakketKnop } from '@/components/BewijspakketKnop'
import Link from 'next/link'
import type { CZOSamenvatting } from '@/types'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.rol === 'BEHEERDER') redirect('/beheer')

  const { zorginstellingId, naam } = session.user
  if (!zorginstellingId) redirect('/login')

  const [zorginstelling, czos, kwartaalaudits, opdrachtenInstelling] = await Promise.all([
    adapter.getZorginstelling(zorginstellingId),
    adapter.getCZOsVoorInstelling(zorginstellingId),
    adapter.getKwartaalauditsVoorInstelling(zorginstellingId),
    adapter.getOpdrachtenVoorInstelling(zorginstellingId),
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

  const overigeStatus = berekenVisueleStatusVoorInstelling(aandachtspunten)

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
      aantalOpdrachten: (opdrachtenPerCZO[czo.id] ?? []).filter(o => o.zorginstellingId === zorginstellingId).length,
      opdrachtgeversCount: opdrachtgeversCountPerCZO[czo.id] ?? 1,
    }
  })

  const aantalDocs = Object.values(documentenPerCZO).flat()
  const aantalGeldig = aantalDocs.filter(d => d.status === 'GELDIG').length
  const aantalLopend = opdrachtenInstelling.filter(o => !o.einddatum || new Date(o.einddatum) >= new Date()).length
  const eerstvolgendeAudit = kwartaalaudits.find(a => a.status === 'CONCEPT')
  const openAandachtspunten = aandachtspunten.filter(a => a.status === 'OPEN').length

  return (
    <div className="min-h-screen">
      <Navigatie rol={session.user.rol} naam={naam} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Kop */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{zorginstelling.naam}</h1>
            <p className="text-sm text-gray-500 mt-1">Kwartaaloverzicht Q2/2026</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={overigeStatus} />
            <BewijspakketKnop />
          </div>
        </div>

        {/* Metric-cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Actieve CZO's" waarde={czos.length.toString()} />
          <MetricCard label="Lopende opdrachten" waarde={aantalLopend.toString()} />
          <MetricCard
            label="Documenten geldig"
            waarde={`${aantalGeldig}/${aantalDocs.length}`}
            kleur={aantalGeldig < aantalDocs.length ? 'amber' : 'green'}
          />
          <MetricCard
            label="Aandachtspunten"
            waarde={openAandachtspunten.toString()}
            kleur={openAandachtspunten > 0 ? 'amber' : 'green'}
            sub={eerstvolgendeAudit ? `Audit ${eerstvolgendeAudit.kwartaal} open` : undefined}
          />
        </div>

        {/* Systeem-compliance uitleg */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
          <span className="font-medium">Systeemgarantie: </span>
          De ledenadministratie van SamenOntzorgen kan een niet-compliant lid technisch niet activeren. Een actieve lidstatus betekent per definitie volledige compliance op dit moment.
        </div>

        {/* CZO-lijst */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Actieve CZO's</h2>
            <span className="text-sm text-gray-500">{czos.length} professionals</span>
          </div>

          <div className="divide-y divide-gray-50">
            {czoSamenvattingen.map(({ czo, visueleStatus, aantalOpdrachten, opdrachtgeversCount }) => (
              <Link
                key={czo.id}
                href={`/dashboard/czo/${czo.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <StatusStip status={visueleStatus} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{czo.bedrijfsnaam ?? czo.naam}</span>
                    {czo.status === 'HOLD' && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Hold</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">{czo.naam} &middot; {czo.functie}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-gray-600">{aantalOpdrachten} opdracht{aantalOpdrachten !== 1 ? 'en' : ''}</div>
                  {czo.eigenTarief && (
                    <div className="text-gray-400">€ {Number(czo.eigenTarief)}/uur</div>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>

        {/* Kwartaalaudit */}
        {eerstvolgendeAudit && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <span className="font-medium">Actie vereist: </span>
            Kwartaalaudit {eerstvolgendeAudit.kwartaal} is nog niet ondertekend. Neem contact op met uw contactpersoon bij SamenOntzorgen.
          </div>
        )}
      </main>
    </div>
  )
}

function MetricCard({
  label, waarde, kleur = 'gray', sub,
}: {
  label: string; waarde: string; kleur?: 'gray' | 'green' | 'amber'; sub?: string
}) {
  const kleuren = {
    gray: 'text-gray-900',
    green: 'text-green-700',
    amber: 'text-amber-700',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${kleuren[kleur]}`}>{waarde}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}
