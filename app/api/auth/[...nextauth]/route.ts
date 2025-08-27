import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import connectDB from '@/lib/mongodb'
import { User } from '@/models'
import bcrypt from 'bcryptjs'

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
    }
  }
  
  interface User {
    id: string
    email: string
    name: string
    image?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string
    email: string
    name: string
    image?: string
  }
}

export const authOptions: any = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials:', { email: !!credentials?.email, password: !!credentials?.password })
          return null
        }

        try {
          console.log('🔐 Attempting to authenticate:', credentials.email)
          await connectDB()
          
          const user = await User.findOne({ email: credentials.email })
          console.log('👤 User found:', user ? 'Yes' : 'No')
          
          if (!user) {
            console.log('❌ No user found with email:', credentials.email)
            return null
          }
          
          if (!user.passwordHash) {
            console.log('❌ User has no password (Google account)')
            return null
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash)
          console.log('🔑 Password valid:', isPasswordValid)
          
          if (!isPasswordValid) {
            console.log('❌ Invalid password for user:', credentials.email)
            return null
          }

          // Update last login
          user.lastLoginAt = new Date()
          await user.save()

          console.log('✅ Authentication successful for:', credentials.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`.trim(),
            image: user.avatar
          }
        } catch (error) {
          console.error('❌ Credentials auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === 'google') {
        try {
          await connectDB()
          
          // Check if user already exists
          const existingUser = await User.findOne({ email: user.email })
          
          if (!existingUser) {
            // Create new user with Google profile data
            const newUser = new User({
              email: user.email,
              googleId: profile?.sub,
              firstName: user.name?.split(' ')[0] || 'User',
              lastName: user.name?.split(' ').slice(1).join(' ') || 'User',
              avatar: user.image,
              emailVerified: true,
              subscriptionTier: 'basic',
              subscriptionStatus: 'active',
              subscriptionStartDate: new Date(),
              subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              hoursUsed: 0,
              hoursLimit: 30,
            })
            
            await newUser.save()
            // Set the user.id to the MongoDB _id for JWT token
            user.id = newUser._id.toString()
            console.log('✅ New user created:', newUser.email)
          } else {
            // Update existing user's Google info
            existingUser.googleId = profile?.sub
            existingUser.avatar = user.image
            existingUser.lastLoginAt = new Date()
            await existingUser.save()
            // Set the user.id to the MongoDB _id for JWT token
            user.id = existingUser._id.toString()
            console.log('✅ Existing user updated:', existingUser.email)
          }
          
          return true
        } catch (error) {
          console.error('❌ Error during sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.userId = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.userId
        session.user.email = token.email
        session.user.name = token.name
        session.user.image = token.image
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
