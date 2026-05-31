import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";
import { cn } from "@/lib/utils";

export const alt = "BringBucket — Bring Your Own Cloud";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const fontMedium = readFileSync(
    join(process.cwd(), "public/fonts/Inter-Medium.woff"),
  );
  const fontBold = readFileSync(
    join(process.cwd(), "public/fonts/Inter-Bold.woff"),
  );
  const fontRegular = readFileSync(
    join(process.cwd(), "public/fonts/Inter-Regular.woff"),
  );
  const logoBuffer = readFileSync(
    join(process.cwd(), "public/bringbutket-logo.png"),
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        tw="relative flex h-full w-full flex-col bg-zinc-950 text-white p-16"
      >
        {/* Purple glow — top left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -120,
            width: 520,
            height: 520,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.3) 0%, transparent 65%)",
          }}
        />

        {/* Logo + wordmark */}
        <div tw="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BringBucket"
            src={logoSrc}
            width={44}
            height={44}
            style={{ objectFit: "contain" }}
          />
          <span tw="ml-3 text-2xl font-medium text-zinc-100">BringBucket</span>
        </div>

        {/* Headline */}
        <h1
          tw="mt-14 text-7xl font-bold text-white max-w-4xl"
          style={{ lineHeight: 1.08, letterSpacing: "-2.5px" }}
        >
          Bring Your{" "}
          <span tw="text-violet-400">Own Cloud.</span>
        </h1>

        {/* Description */}
        <p
          tw="mt-5 text-2xl text-zinc-400 max-w-3xl"
          style={{ lineHeight: 1.55 }}
        >
          Connect your S3-compatible storage. Manage files, share links, and
          control your data — without vendor lock-in.
        </p>

        {/* Bottom bar */}
        <div tw="mt-auto flex items-center justify-between">
          <span tw="text-lg font-medium text-zinc-600">bringbucket.com</span>
          <div tw="flex items-center" style={{ gap: 10 }}>
            {["AWS S3", "Cloudflare R2", "MinIO", "Supabase"].map((p) => (
              <span
                key={p}
                tw="text-violet-400 text-sm font-medium rounded-full px-4 py-1"
                style={{
                  border: "1px solid rgba(139,92,246,0.4)",
                  backgroundColor: "rgba(109,40,217,0.08)",
                  lineHeight: 1,
                  paddingTop: 6,
                  paddingBottom: 6,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: fontRegular, style: "normal", weight: 400 },
        { name: "Inter", data: fontMedium, style: "normal", weight: 500 },
        { name: "Inter", data: fontBold, style: "normal", weight: 700 },
      ],
    },
  );
}
