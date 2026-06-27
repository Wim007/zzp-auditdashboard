import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Placeholder-weergave voor geüploade documenten totdat een echte documentopslag
// (bijv. S3/Blob met signed URLs) is gekoppeld aan bestandsverwijzing.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const html = `<!doctype html>
<html lang="nl"><head><meta charset="utf-8"><title>Document ${params.id}</title></head>
<body style="font-family: sans-serif; max-width: 480px; margin: 64px auto; color: #111827;">
  <h1 style="font-size: 18px;">Document ${params.id}</h1>
  <p style="color: #6b7280; font-size: 14px;">
    Dit is een placeholder voor het geüploade document. Koppel hier de echte documentopslag
    (bijv. een signed URL naar S3/Blob storage) om het originele bestand te tonen.
  </p>
</body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}
