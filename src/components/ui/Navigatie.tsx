'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import type { Rol } from '@/types'

export function Navigatie({ rol, naam }: { rol: Rol; naam: string }) {
  const pad = usePathname()

  const links = rol === 'BEHEERDER'
    ? [
        { href: '/beheer', label: 'Overzicht' },
        { href: '/beheer/log', label: 'Toegangslog' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/dashboard/aandachtspunten', label: 'Aandachtspunten' },
      ]

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-semibold text-gray-900 text-sm">SamenOntzorgen</span>
        <div className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                pad === l.href || pad.startsWith(l.href + '/')
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{naam}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          Uitloggen
        </button>
      </div>
    </nav>
  )
}
