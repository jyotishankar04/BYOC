import { ImageResponse } from "next/og";
import { cn } from "@/lib/utils";

export const runtime = "edge";

const DEFAULT_TITLE = "Bring Your Own Cloud";
const DEFAULT_DESC =
  "Connect your S3-compatible storage. Manage files, share links, and control your data — without vendor lock-in.";

const fontMedium = (origin: string) =>
  fetch(new URL("/fonts/Inter-Medium.woff", origin)).then((r) =>
    r.arrayBuffer(),
  );
const fontRegular = (origin: string) =>
  fetch(new URL("/fonts/Inter-Regular.woff", origin)).then((r) =>
    r.arrayBuffer(),
  );
const fontBold = (origin: string) =>
  fetch(new URL("/fonts/Inter-Bold.woff", origin)).then((r) =>
    r.arrayBuffer(),
  );

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const params = Object.fromEntries(new URL(req.url).searchParams);

  const title = params.title ?? DEFAULT_TITLE;
  const description = params.description ?? DEFAULT_DESC;
  const mode = (params.mode ?? "dark") as "dark" | "light";
  const dark = mode === "dark";

  const [medium, regular, bold, logo] = await Promise.all([
    fontMedium(origin),
    fontRegular(origin),
    fontBold(origin),
    fetch(new URL("/bringbutket-logo.png", origin)).then((r) =>
      r.arrayBuffer(),
    ),
  ]);

  const logoSrc = `data:image/png;base64,${Buffer.from(logo).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        tw={cn(
          "relative flex h-full w-full flex-col p-16",
          dark ? "bg-zinc-950 text-white" : "bg-white text-black",
        )}
      >
        {/* Subtle glow — top left */}
        {dark && (
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
        )}

        {/* Logo + wordmark */}
        <div tw="flex items-center">
          <img
            alt="BringBucket"
            src={logoSrc}
            width={44}
            height={44}
            style={{ objectFit: "contain" }}
          />
          <span
            tw={cn(
              "ml-3 text-2xl font-medium",
              dark ? "text-zinc-100" : "text-zinc-800",
            )}
          >
            BringBucket
          </span>
        </div>

        {/* Title */}
        <h1
          tw={cn(
            "mt-14 text-7xl font-bold leading-tight tracking-tight max-w-4xl",
            dark ? "text-white" : "text-zinc-900",
          )}
          style={{ lineHeight: 1.08, letterSpacing: "-2.5px" }}
        >
          {title}
        </h1>

        {/* Description */}
        <p
          tw={cn(
            "mt-5 text-2xl max-w-3xl",
            dark ? "text-zinc-400" : "text-zinc-500",
          )}
          style={{ lineHeight: 1.55 }}
        >
          {description}
        </p>

        {/* Bottom bar */}
        <div tw="mt-auto flex items-center justify-between">
          <span
            tw={cn(
              "text-lg font-medium",
              dark ? "text-zinc-600" : "text-zinc-400",
            )}
          >
            bringbucket.com
          </span>
          <div tw="flex items-center" style={{ gap: 10 }}>
            {["AWS S3", "Cloudflare R2", "MinIO", "Supabase"].map((p) => (
              <span
                key={p}
                tw="text-violet-400 text-sm font-medium rounded-full px-4 py-1"
                style={{
                  border: "1px solid rgba(139,92,246,0.4)",
                  backgroundColor: dark
                    ? "rgba(109,40,217,0.08)"
                    : "rgba(109,40,217,0.06)",
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
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: regular, style: "normal", weight: 400 },
        { name: "Inter", data: medium, style: "normal", weight: 500 },
        { name: "Inter", data: bold, style: "normal", weight: 700 },
      ],
    },
  );
}
