/**
 * NextAuth.js v4 configuration
 * Using Credentials provider (email + bcrypt password).
 * Adapter: PrismaAdapter for session persistence.
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Adapter } from 'next-auth/adapters'

export const authOptions: NextAuthOptions = {
  // Adapter enables JWT-less DB sessions
  adapter: PrismaAdapter(prisma) as Adapter,

  // Use JWT for session strategy (required with Credentials provider)
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days

  pages: {
    signIn: '/login',
    error:  '/login',
  },

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        })

        if (!user || !user.password) {
          throw new Error('Credenciales inválidas')
        }

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) {
          throw new Error('Credenciales inválidas')
        }

        return {
          id:                 user.id,
          email:              user.email,
          name:               user.name,
          subscriptionStatus: user.subscriptionStatus,
          plan:               user.plan,
          waId:               user.waId,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000)

      // On first sign-in, user object is populated → stamp all claims
      if (user) {
        token.id                 = user.id
        token.subscriptionStatus = (user as unknown as Record<string, unknown>).subscriptionStatus as string
        token.plan               = (user as unknown as Record<string, unknown>).plan as string
        token.waId               = (user as unknown as Record<string, unknown>).waId as string | null ?? null
        token.refreshedAt        = now
        return token
      }

      // Re-fetch from DB every 5 min so Stripe webhook changes propagate to
      // the cookie without requiring the user to sign out and back in.
      // SessionProvider polls every 5 min → triggers this → updates the cookie →
      // middleware reads the fresh status on the next navigation.
      const REFRESH_INTERVAL = 5 * 60
      const lastRefresh       = (token.refreshedAt as number | undefined) ?? 0
      const shouldRefresh     = !token.id || (now - lastRefresh) > REFRESH_INTERVAL

      if (shouldRefresh && token.id) {
        const dbUser = await prisma.user.findUnique({
          where:  { id: token.id as string },
          select: { subscriptionStatus: true, plan: true, waId: true },
        })
        if (dbUser) {
          token.subscriptionStatus = dbUser.subscriptionStatus
          token.plan               = dbUser.plan
          token.waId               = dbUser.waId ?? null
          token.refreshedAt        = now
        }
      }

      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id                 = token.id as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.plan               = token.plan as string
        session.user.waId               = token.waId as string | null
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

// Extend next-auth types
declare module 'next-auth' {
  interface Session {
    user: {
      id:                 string
      email:              string
      name?:              string | null
      subscriptionStatus: string
      plan:               string
      waId:               string | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:                 string
    subscriptionStatus: string
    plan:               string
    waId:               string | null
    refreshedAt?:       number
  }
}
