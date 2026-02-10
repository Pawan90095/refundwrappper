import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";

const providers = [];

// Optional Google OAuth provider (requires env vars)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    );
}

// Optional SMTP email provider (for real email magic links)
if (
    process.env.EMAIL_SERVER_HOST &&
    process.env.EMAIL_SERVER_PORT &&
    process.env.EMAIL_SERVER_USER &&
    process.env.EMAIL_SERVER_PASSWORD &&
    process.env.EMAIL_FROM
) {
    providers.push(
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
        })
    );
}

// Always-available dev-friendly credentials provider
providers.push(
    CredentialsProvider({
        name: "Demo Login",
        credentials: {
            email: { label: "Email", type: "email" },
        },
        async authorize(credentials) {
            const email = credentials?.email;
            if (!email) {
                return null;
            }

            // Simple, passwordless dev login; in real prod, validate properly
            return {
                id: email,
                name: email.split("@")[0] || "User",
                email,
            };
        },
    })
);

export const authOptions: NextAuthOptions = {
    providers,
    secret: process.env.NEXTAUTH_SECRET || "dev-secret-do-not-use-in-prod",
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
        async jwt({ token, user }) {
            return token;
        },
    },
    debug: process.env.NODE_ENV === "development",
};
