import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Veiligheidsdashboard — SamenOntzorgen',
  description: 'Compliance- en veiligheidsdashboard voor zorginstellingen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={inter.variable}>
      <body className="bg-[#FAFAFA] text-[#2C3E50] font-sans min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
