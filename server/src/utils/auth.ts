import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // Email + Password auth
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },

  // Google OAuth only
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // Email OTP (passwordless login)
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // TODO: Replace with your email provider (Resend, SendGrid, etc.)
        console.log(`Send OTP ${otp} to ${email} (type: ${type})`);
      },
    }),
  ],

  // Map to your Prisma model names
  user: { modelName: "user" },
  session: { modelName: "session" },
  account: { modelName: "account" },
  verification: { modelName: "verification" },
});
