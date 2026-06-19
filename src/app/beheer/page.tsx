import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adapter } from '@/lib/adapters'
import { Navigatie } from '@/components/ui/Navigatie'
import Link from 'next/link'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default async function BeheerPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.rol !== 'BEHEERDER') redirect('/dashboard')

  const [instellingen, logs, alleCzos] = await Promise.all([
    adapter.getAlleZorginstellingen(),
    adapter.getToegangslogsVoorBeheerder(20),
    adapter.getAlleCZOs(),
  ])

  return (
    <div className="min-h-screen">
      <Navigatie rol={session.user.rol} naam={session.user.naam} />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Beheer — SamenOntzorgen</h1>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-500">Instellingen</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{instellingen.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-500">CZO's totaal</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{alleCzos.length}</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-xs text-gray-500">Recente inzages</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</div>
          </div>
        </div>

        {/* Instellingen */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Zorginstellingen</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {instellingen.map((inst) => (
              <div key={inst.id} className="px-6 py-4 text-sm">
                <div className="font-medium text-gray-900">{inst.naam}</div>
                <div className="text-gray-500 text-xs mt-0.5">{inst.contactEmail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Toegangslog */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recente toegangslog (AVG)</h2>
            <Link href="/beheer/log" className="text-xs text-blue-600 hover:underline">Volledig log</Link>
          </div>
          {logs.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              Nog geen inzages geregistreerd. Ze verschijnen hier zodra gebruikers het dashboard gebruiken.
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {logs.map((log) => (
                <div key={log.id} className="px-6 py-3 text-sm flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="font-medium text-gray-900">{log.gebruikerNaam ?? log.gebruikerId}</span>
                    <span className="text-gray-500"> · {log.actie} · {log.doelNaam ?? log.doelId}</span>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {format(new Date(log.tijdstip), 'dd-MM-yyyy HH:mm', { locale: nl })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
