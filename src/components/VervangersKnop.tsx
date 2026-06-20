'use client'
import { useState } from 'react'

export function VervangersKnop({ czoNaam }: { czoNaam: string }) {
  const [verstuurd, setVerstuurd] = useState(false)

  if (verstuurd) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-green-700 font-medium bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Aanvraag verstuurd naar SamenOntzorgen
      </span>
    )
  }

  return (
    <button
      onClick={() => setVerstuurd(true)}
      className="flex-shrink-0 flex items-center gap-1.5 text-xs font-medium bg-white border border-amber-400 text-amber-800 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
      Vervanger aanvragen
    </button>
  )
}
