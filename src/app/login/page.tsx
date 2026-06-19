'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [fout, setFout] = useState('')
  const [bezig, setBezig] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBezig(true)
    setFout('')

    const result = await signIn('credentials', {
      email,
      password: wachtwoord,
      redirect: false,
    })

    setBezig(false)
    if (result?.error) {
      setFout('E-mailadres of wachtwoord onjuist.')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">SamenOntzorgen</h1>
            <p className="text-sm text-gray-500 mt-1">Veiligheidsdashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mailadres
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="uw@emailadres.nl"
              />
            </div>
            <div>
              <label htmlFor="wachtwoord" className="block text-sm font-medium text-gray-700 mb-1">
                Wachtwoord
              </label>
              <input
                id="wachtwoord"
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {fout && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                {fout}
              </div>
            )}

            <button
              type="submit"
              disabled={bezig}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {bezig ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-2">Demo-accounts</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="font-mono bg-gray-100 px-1 rounded">inkoop@delinden.nl</span> / linden123 — Zorginkoper</p>
              <p><span className="font-mono bg-gray-100 px-1 rounded">beheerder@samenontzorgen.nl</span> / beheerder123 — Beheerder</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
