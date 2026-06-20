import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { adapter } from '@/lib/adapters'
import { instellingMagCZOZien } from '@/lib/scoping'
import { berekenGezichtspunten } from '@/lib/gezichtspunten'
import { Navigatie } from '@/components/ui/Navigatie'
import { StatusBadge, DocumentStatusBadge } from '@/components/ui/StatusBadge'
import { BewijspakketKnop } from '@/components/BewijspakketKnop'
import Link from 'next/link'
import type { Document, GezichtspuntBeoordeling } from '@/types'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

const docTypeLabel: Record<string, string> = {
  DIPLOMA: 'Diploma', BIG: 'BIG-registratie', VOG: 'VOG',
  BAV: 'Beroepsaansprakelijkheids­verzekering', AOV: 'Arbeidsongeschiktheids­verzekering',
  WKKGZ: 'Wkkgz-klachtaansluiting', SCHOLING: 'Scholing', KVK: 'KvK-uittreksel',
}

const gezichtspuntKleur: Record<string, string> = {
  CONFORM: 'bg-green-50 border-green-200 text-green-900',
  AANDACHT: 'bg-amber-50 border-amber-200 text-amber-900',
  RISICO: 'bg-red-50 border-red-200 text-red-900',
}

const gezichtspuntBadge: Record<string, string> = {
  CONFORM: 'bg-green-100 text-green-800',
  AANDACHT: 'bg-amber-100 text-amber-800',
  RISICO: 'bg-red-100 text-red-800',
}

const gewichtLabel: Record<string, string> = {
  ZWAAR: 'Zwaar wegend',
  NORMAAL: 'Normaal wegend',
  LICHT: 'Licht wegend',
}

export default async function CZODetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { zorginstellingId, rol, naam } = session.user
  const [czo, documenten, opdrachten, opdrachtgeversCount] = await Promise.all([
    adapter.getCZO(params.id),
    adapter.getDocumentenVoorCZO(params.id),
    adapter.getOpdrachtenVoorCZO(params.id),
    adapter.getOpdrachtgeversCountVoorCZO(params.id),
  ])

  if (!czo) notFound()

  if (rol === 'INSTELLING_GEBRUIKER') {
    if (!zorginstellingId || !instellingMagCZOZien(zorginstellingId, opdrachten)) {
      return (
        <div className="min-h-screen">
          <Navigatie rol={rol} naam={naam} />
          <main className="max-w-2xl mx-auto px-6 py-16 text-center">
            <p className="text-gray-600">U heeft geen toegang tot dit dossier.</p>
            <Link href="/dashboard" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Terug naar dashboard</Link>
          </main>
        </div>
      )
    }
  }

  const score = berekenGezichtspunten({ czo, documenten, opdrachten, opdrachtgeversCount })

  const bekwaamheidsDocs = documenten.filter(d => ['DIPLOMA', 'BIG', 'VOG', 'WKKGZ', 'SCHOLING'].includes(d.type))
  const ondernemersDocs = documenten.filter(d => ['KVK', 'BAV', 'AOV'].includes(d.type))

  const alleenViaSO = opdrachtgeversCount <= 1

  return (
    <div className="min-h-screen">
      <Navigatie rol={rol} naam={naam} />
      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* Broodkruimel */}
        <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← Terug naar dashboard
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{czo.bedrijfsnaam ?? czo.naam}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {czo.bedrijfsnaam ? `${czo.naam} · ` : ''}{czo.functie}{czo.eigenTarief ? ` · € ${Number(czo.eigenTarief)}/uur` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={score.totaalStatus} />
            <BewijspakketKnop czoIds={[czo.id]} />
          </div>
        </div>

        {/* Systeem-compliance melding */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 mb-6">
          Status als lid: <span className="font-medium">{czo.status === 'ACTIEF' ? 'Actief — volledig compliant' : 'Hold — niet actief als lid'}</span>.
          Het systeem kan een niet-compliant CZO niet inroosteren.
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Bekwaamheidsdossier */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 text-sm">Bekwaamheidsdossier</h2>
              <p className="text-xs text-gray-500 mt-0.5">Mag deze persoon de taak uitvoeren?</p>
            </div>
            <div className="divide-y divide-gray-50">
              {bekwaamheidsDocs.length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-400">Geen documenten geregistreerd.</p>
              )}
              {bekwaamheidsDocs.map((doc) => <DocRij key={doc.id} doc={doc} />)}
            </div>
          </section>

          {/* Ondernemerschapsdossier */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-900 text-sm">Ondernemerschapsdossier</h2>
              <p className="text-xs text-gray-500 mt-0.5">Is deze persoon echt zelfstandig? (DBA)</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm pb-3 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">KvK-nummer</p>
                  <p className="font-medium">{czo.kvkNummer ?? <span className="text-red-600">Ontbreekt</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Eigen tarief</p>
                  <p className="font-medium">{czo.eigenTarief ? `€ ${Number(czo.eigenTarief)}/uur` : <span className="text-amber-600">Niet ingesteld</span>}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Opdrachtgevers</p>
                  <p className="font-medium">{opdrachtgeversCount} instelling{opdrachtgeversCount !== 1 ? 'en' : ''}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Spreiding</p>
                  {alleenViaSO
                    ? <p className="font-medium text-amber-600">Alleen via SO</p>
                    : <p className="font-medium text-green-700">Gespreid</p>}
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {ondernemersDocs.map((doc) => <DocRij key={doc.id} doc={doc} />)}
              </div>
            </div>
          </section>
        </div>

        {/* Opdrachtenlijst */}
        <section className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">Opdrachten</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {opdrachten.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">Geen opdrachten.</p>}
            {opdrachten.map((o) => (
              <div key={o.id} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-900">{o.zorginstellingNaam ?? o.zorginstellingId}</span>
                    {o.afdeling && <span className="text-gray-500"> · {o.afdeling}</span>}
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(o.startdatum), 'dd-MM-yyyy', { locale: nl })}
                    {' — '}
                    {o.einddatum ? format(new Date(o.einddatum), 'dd-MM-yyyy', { locale: nl }) : 'heden'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Negen gezichtspunten */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Negen gezichtspunten (Deliveroo/Uber-arrest)</h2>
            <StatusBadge status={score.totaalStatus} />
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Gewogen beoordeling: zwaar wegende punten (inbedding, gezag, ondernemerschap, economische afhankelijkheid) trekken de totaalstatus naar aandacht/risico, ook als de rest groen is.
          </p>
          <div className="space-y-2">
            {score.gezichtspunten.map((g) => <GezichtspuntRij key={g.id} g={g} />)}
          </div>
        </section>
      </main>
    </div>
  )
}

function DocRij({ doc }: { doc: Document }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 gap-2">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-900">{docTypeLabel[doc.type] ?? doc.type}</p>
        {doc.omschrijving && <p className="text-xs text-gray-500 truncate">{doc.omschrijving}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 text-right">
        {doc.vervaldatum && (
          <p className="text-xs text-gray-400">{format(new Date(doc.vervaldatum), 'dd-MM-yyyy')}</p>
        )}
        <DocumentStatusBadge status={doc.status} />
      </div>
    </div>
  )
}

function GezichtspuntRij({ g }: { g: GezichtspuntBeoordeling }) {
  const containerKleur = gezichtspuntKleur[g.status]
  const badgeKleur = gezichtspuntBadge[g.status]
  return (
    <details className={`border rounded-lg overflow-hidden ${g.status !== 'CONFORM' ? containerKleur : 'border-gray-200'}`}>
      <summary className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none ${g.status !== 'CONFORM' ? '' : 'bg-white hover:bg-gray-50'}`}>
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium truncate">{g.naam}</span>
          <span className="text-xs text-gray-400 hidden sm:inline">{gewichtLabel[g.gewicht]}</span>
        </div>
        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${badgeKleur}`}>
          {g.status === 'CONFORM' ? 'Conform' : g.status === 'AANDACHT' ? 'Aandacht' : 'Risico'}
        </span>
      </summary>
      <div className="px-4 pb-3 pt-1 text-sm space-y-1 border-t border-current border-opacity-20">
        <p className="text-gray-600">{g.omschrijving}</p>
        {g.toelichting && <p className="text-sm">{g.toelichting}</p>}
        {g.mitigatie && (
          <p className="text-sm font-medium">
            Mitigatie: <span className="font-normal">{g.mitigatie}</span>
          </p>
        )}
      </div>
    </details>
  )
}
