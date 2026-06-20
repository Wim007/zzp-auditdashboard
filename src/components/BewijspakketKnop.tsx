'use client'
import { useState } from 'react'
import type { BewijspakketVariant } from '@/types'

export function BewijspakketKnop({ czoIds }: { czoIds?: string[] }) {
  const [open, setOpen] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState('')

  async function genereer(variant: BewijspakketVariant) {
    setBezig(true)
    setFout('')
    setOpen(false)
    try {
      const res = await fetch('/api/bewijspakket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ czoIds, variant }),
      })
      if (!res.ok) {
        const data = await res.json()
        setFout(data.error ?? 'Genereren mislukt')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const datum = new Date().toISOString().split('T')[0]
      a.download = `bewijspakket-${variant.toLowerCase()}-${datum}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setFout('Verbindingsfout bij genereren')
    } finally {
      setBezig(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={bezig}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {bezig ? 'Genereren...' : 'Genereer verklaring'}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
          <p className="px-4 py-2 text-xs text-gray-500 font-medium uppercase tracking-wide">Kies variant</p>
          {[
            { v: 'DBA' as BewijspakketVariant, label: 'Belastingdienst (DBA)', omschrijving: 'Ondernemerschapsdossier' },
            { v: 'KWALITEIT' as BewijspakketVariant, label: 'Kwaliteitscontrole', omschrijving: 'Bekwaamheidsdossier' },
            { v: 'VOLLEDIG' as BewijspakketVariant, label: 'Volledig', omschrijving: 'Beide dossiers' },
          ].map(({ v, label, omschrijving }) => (
            <button
              key={v}
              onClick={() => genereer(v)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
            >
              <div className="text-sm font-medium text-gray-900">{label}</div>
              <div className="text-xs text-gray-500">{omschrijving}</div>
            </button>
          ))}
        </div>
      )}

      {fout && (
        <div className="absolute right-0 mt-2 w-64 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 z-10">
          {fout}
        </div>
      )}
    </div>
  )
}
