import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { adapter } from '@/lib/adapters'
import { Navigatie } from '@/components/ui/Navigatie'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

export default async function LogPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if (session.user.rol !== 'BEHEERDER') redirect('/dashboard')

  const logs = await adapter.getToegangslogsVoorBeheerder(200)

  return (
    <div className="min-h-screen">
      <Navigatie rol={session.user.rol} naam={session.user.naam} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/beheer" className="text-sm text-blue-600 hover:underline">← Beheer</Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Toegangslog</h1>
        <p className="text-sm text-gray-500 mb-6">
          Alle inzages en gegenereerde verklaringen worden hier geregistreerd conform de AVG.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {logs.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-400">Nog geen inzages geregistreerd.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tijdstip</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Gebruiker</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Actie</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Doel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {format(new Date(log.tijdstip), 'dd-MM-yyyy HH:mm:ss', { locale: nl })}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {log.gebruikerNaam ?? log.gebruikerId}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        log.actie.startsWith('BEWIJSPAKKET')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {log.actie}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.doelNaam ?? log.doelId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
