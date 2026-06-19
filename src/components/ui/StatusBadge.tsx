import type { VisueleStatus } from '@/types'

const config: Record<VisueleStatus, { label: string; klassen: string }> = {
  VEILIG: { label: 'Veilig', klassen: 'bg-green-100 text-green-800' },
  AANDACHT: { label: 'Aandacht', klassen: 'bg-amber-100 text-amber-800' },
  RISICO: { label: 'Risico', klassen: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status }: { status: VisueleStatus }) {
  const { label, klassen } = config[status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${klassen}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function StatusStip({ status }: { status: VisueleStatus | 'HOLD' }) {
  const kleuren: Record<string, string> = {
    VEILIG: 'bg-green-500',
    AANDACHT: 'bg-amber-500',
    RISICO: 'bg-red-500',
    HOLD: 'bg-gray-400',
  }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${kleuren[status] ?? 'bg-gray-400'}`} />
}

export function DocumentStatusBadge({ status }: { status: 'GELDIG' | 'AANDACHT' | 'ONTBREEKT' }) {
  const config = {
    GELDIG: { label: 'Geldig', klassen: 'bg-green-100 text-green-800' },
    AANDACHT: { label: 'Aandacht', klassen: 'bg-amber-100 text-amber-800' },
    ONTBREEKT: { label: 'Ontbreekt', klassen: 'bg-red-100 text-red-800' },
  }
  const { label, klassen } = config[status]
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${klassen}`}>{label}</span>
}
