import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        // EmailProvider requires a database adapter usually, but we can use it for magic links if configured correctly with SMTP
        // For now, we will just include Google as primary. Email requires more setup (SMTP or DB).
        // Let's stick to Google for simplicity first, or just credentials if user wants simple pass.
        // User asked for "email and google auth".
        // Build a simple credentials provider for testing? No, user wants email.
        // EmailProvider sends magic links. Needs SMTP.
        // Let's add EmailProvider but comment out SMTP settings until user provides them.
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: process.env.EMAIL_SERVER_PORT,
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD
                }
            },
            from: process.env.EMAIL_FROM
        }),
    ],
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
};
