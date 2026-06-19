import type { NextAuthOptions, Session, User } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import type { Rol } from '@/types'

// Demo-accounts voor Fase 1 (vervang door database-lookup in productie)
const DEMO_GEBRUIKERS = [
  {
    id: 'user-beheerder',
    email: 'beheerder@samenontzorgen.nl',
    passwordHash: bcrypt.hashSync('beheerder123', 10),
    naam: 'Beheerder SamenOntzorgen',
    rol: 'BEHEERDER' as Rol,
    zorginstellingId: null,
  },
  {
    id: 'user-linden',
    email: 'inkoop@delinden.nl',
    passwordHash: bcrypt.hashSync('linden123', 10),
    naam: 'Zorginkoop De Linden',
    rol: 'INSTELLING_GEBRUIKER' as Rol,
    zorginstellingId: 'inst-linden',
  },
]

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      naam: string
      rol: Rol
      zorginstellingId: string | null
    }
  }
  interface User {
    id: string
    naam: string
    rol: Rol
    zorginstellingId: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    naam: string
    rol: Rol
    zorginstellingId: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'E-mailadres', type: 'email' },
        password: { label: 'Wachtwoord', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const gebruiker = DEMO_GEBRUIKERS.find(
          (g) => g.email.toLowerCase() === credentials.email.toLowerCase()
        )
        if (!gebruiker) return null

        const klopt = await bcrypt.compare(credentials.password, gebruiker.passwordHash)
        if (!klopt) return null

        return {
          id: gebruiker.id,
          email: gebruiker.email,
          naam: gebruiker.naam,
          rol: gebruiker.rol,
          zorginstellingId: gebruiker.zorginstellingId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.naam = user.naam
        token.rol = user.rol
        token.zorginstellingId = user.zorginstellingId
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email ?? '',
        naam: token.naam,
        rol: token.rol,
        zorginstellingId: token.zorginstellingId,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET ?? 'dev-geheim-vervang-in-productie',
}

export function isInstelling(session: Session): boolean {
  return session.user.rol === 'INSTELLING_GEBRUIKER'
}

export function isBeheerder(session: Session): boolean {
  return session.user.rol === 'BEHEERDER'
}
