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

  async function login(e: string, p: string) {
    setBezig(true)
    setFout('')
    const result = await signIn('credentials', { email: e, password: p, redirect: false })
    setBezig(false)
    if (result?.error) {
      setFout('Inloggen mislukt.')
    } else {
      router.push('/')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await login(email, wachtwoord)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="mb-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/samenontzorgen-logo.svg" alt="SamenOntzorgen" className="h-10 w-auto mx-auto mb-3" />
            <p className="text-sm text-gray-500 mt-1">Veiligheidsdashboard</p>
          </div>

          {/* Demo-knop — één klik toegang */}
          <div className="mb-6">
            <button
              onClick={() => login('inkoop@delinden.nl', 'linden123')}
              disabled={bezig}
              className="w-full bg-accent hover:bg-accent-dark disabled:opacity-50 text-white font-medium rounded-lg px-4 py-3 text-sm transition-colors text-left flex items-center justify-between"
            >
              <span>
                <span className="font-semibold">Bekijk demo</span>
                <span className="text-white/80 ml-2 text-xs">Thuiszorg De Linden</span>
              </span>
              <span className="text-white/80 text-xs">{bezig ? '...' : 'Inloggen →'}</span>
            </button>
          </div>

          {fout && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700 mb-4">
              {fout}
            </div>
          )}

          {/* Optioneel handmatig inloggen */}
          <details className="mt-2">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 text-center">
              Handmatig inloggen
            </summary>
            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="e-mailadres"
              />
              <input
                type="password"
                value={wachtwoord}
                onChange={(e) => setWachtwoord(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="wachtwoord"
              />
              <button
                type="submit"
                disabled={bezig}
                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                {bezig ? 'Inloggen...' : 'Inloggen'}
              </button>
            </form>
          </details>
        </div>
      </div>
    </div>
  )
}
