import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/env.mjs';
import isEqual from 'lodash/isEqual';
import { pagesOptions } from './pages-options';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  // debug: true,
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: (token as any).idToken as string,
          role: (token as any).role || 'user',
        },
      };
    },
    async jwt({ token, user }) {
      if (user) {
        // If the provider returned a marker that this is an admin-auth login,
        // attach role=admin. Otherwise, try to resolve role from profiles by email.
        try {
          const supabaseAdmin = getSupabaseAdmin();
          // If authorize() returned isAdmin flag, treat as admin
          if ((user as any).__isAdmin) {
            (token as any).role = 'admin';
            (token as any).idToken = (user as any).id as string;
          } else {
            const email = (user as any).email;
            if (email) {
              const { data: profile } = await supabaseAdmin
                .from('profiles')
                .select('role')
                .eq('email', email)
                .maybeSingle();
              (token as any).role = (profile as any)?.role || 'user';
              (token as any).idToken = (user as any).id as string | undefined;
            } else {
              (token as any).role = 'user';
            }
          }
        } catch (err) {
          (token as any).role = 'user';
        }
        (token as any).user = user;
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      // const parsedUrl = new URL(url, baseUrl);
      // if (parsedUrl.searchParams.has('callbackUrl')) {
      //   return `${baseUrl}${parsedUrl.searchParams.get('callbackUrl')}`;
      // }
      // if (parsedUrl.origin === baseUrl) {
      //   return url;
      // }
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'admin-password',
      name: 'AdminPassword',
      credentials: { password: { label: 'Password', type: 'password' } },
      async authorize(credentials: any) {
        const password = credentials?.password;
        if (!password) return null;

        try {
          const supabaseAdmin = getSupabaseAdmin();
          const { data: row, error } = await supabaseAdmin
            .from('admin_auth')
            .select('id, password_hash')
            .limit(1)
            .single();

          if (error) {
            return null;
          }
          if (!row) {
            return null;
          }

          const match = await bcrypt.compare(password, (row as any).password_hash);
          if (!match) return null;

          // mark user object so jwt callback can set role=admin
          return { id: (row as any).id, __isAdmin: true } as any;
        } catch (err) {
          return null;
        }
      },
    }),
    // Only add Google provider if credentials are configured
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  secret: env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
};
