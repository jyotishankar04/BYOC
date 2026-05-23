import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

export const alt = "BringBucket — Bring Your Own Cloud";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const logo = readFileSync(join(process.cwd(), "public/bringbutket-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#09090B",
          fontFamily: "system-ui, -apple-system, sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Purple glow — top-left */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: -160,
            width: 700,
            height: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(109,40,217,0.35) 0%, rgba(109,40,217,0.08) 55%, transparent 70%)",
          }}
        />
        {/* Purple glow — bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 65%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "72px 80px",
          }}
        >
          {/* Top: logo + wordmark */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={52} height={52} style={{ objectFit: "contain" }} alt="" />
            <span
              style={{
                color: "#E4E4E7",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              BringBucket
            </span>
          </div>

          {/* Middle: headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                fontSize: 80,
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-3px",
                color: "#FAFAFA",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span>Bring Your</span>
              <span style={{ color: "#A855F7" }}>Own Cloud.</span>
            </div>
            <p
              style={{
                fontSize: 26,
                color: "#71717A",
                margin: 0,
                lineHeight: 1.55,
                maxWidth: 640,
                letterSpacing: "-0.3px",
              }}
            >
              Connect your S3-compatible storage. Manage files, share links, and
              control your data — without vendor lock-in.
            </p>
          </div>

          {/* Bottom: domain + provider badges */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ color: "#3F3F46", fontSize: 20, fontWeight: 500 }}>
              bringbucket.com
            </span>
            <div style={{ display: "flex", gap: 10 }}>
              {["AWS S3", "Cloudflare R2", "MinIO", "Supabase"].map(
                (label) => (
                  <div
                    key={label}
                    style={{
                      padding: "7px 16px",
                      borderRadius: 999,
                      border: "1px solid rgba(109,40,217,0.45)",
                      backgroundColor: "rgba(109,40,217,0.08)",
                      color: "#A855F7",
                      fontSize: 16,
                      fontWeight: 500,
                    }}
                  >
                    {label}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
