/**
 * NextAuth.js v4 configuration
 * Using Credentials provider (email + bcrypt password).
 * Adapter: PrismaAdapter for session persistence.
 */

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
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
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is populated
      if (user) {
        token.id                 = user.id
        token.subscriptionStatus = (user as Record<string, unknown>).subscriptionStatus as string
        token.plan               = (user as Record<string, unknown>).plan as string
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id                 = token.id as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.plan               = token.plan as string
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
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:                 string
    subscriptionStatus: string
    plan:               string
  }
}
