import type { VerificatieActieType, BronSoort } from '@/lib/verificatie'
import { bronLabel, actieLabel } from '@/lib/verificatie'

const actieIcon: Record<VerificatieActieType, React.ReactNode> = {
  EXTERN: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  DOCUMENT: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  DOSSIER: (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
}

export function VerificatieRegel({
  label,
  bron,
  status,
  waarde,
  geldigTot,
  actie,
  fallbackTekst = 'Bron ontbreekt',
}: {
  label: string
  bron: BronSoort
  status: 'aanwezig' | 'aandacht' | 'ontbreekt'
  waarde?: string
  geldigTot?: string
  actie?: { type: VerificatieActieType; href: string }
  fallbackTekst?: string
}) {
  const statusKleur =
    status === 'aanwezig' ? 'text-green-700' : status === 'aandacht' ? 'text-amber-600' : 'text-red-600'

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">Bron: {bronLabel[bron]}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          {waarde ? (
            <p className={`font-medium ${statusKleur}`}>{waarde}</p>
          ) : (
            <p className="text-gray-400">{fallbackTekst}</p>
          )}
          {geldigTot && <p className="text-xs text-gray-400">Geldig t/m {geldigTot}</p>}
        </div>
        {actie && (
          <a
            href={actie.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-md transition-colors whitespace-nowrap"
          >
            {actieIcon[actie.type]}
            {actieLabel[actie.type]}
          </a>
        )}
      </div>
    </div>
  )
}
