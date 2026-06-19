import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions, isBeheerder } from '@/lib/auth'
import { adapter } from '@/lib/adapters'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
  if (!isBeheerder(session)) return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })

  const logs = await adapter.getToegangslogsVoorBeheerder(200)
  return NextResponse.json({ logs })
}
