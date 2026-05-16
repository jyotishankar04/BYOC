import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

import fullLogoLight from "@/public/bringbucket.png"
import fullLogoDark from "@/public/bringbucket-dark.png"
import iconLogo from "@/public/bringbutket-logo.png"

type LogoProps = {
  variant?: "icon" | "full"
  href?: string
  className?: string
}

const IMG_BASE = "h-auto"
const FULL_STYLE = `${IMG_BASE} w-[140px]`
const ICON_STYLE = `${IMG_BASE} w-9`

export function Logo({
  variant = "full",
  href = "/",
  className,
}: LogoProps) {
  const alt = "BringBucket"

  const img =
    variant === "icon" ? (
      <Image
        src={iconLogo}
        alt={alt}
        width={36}
        height={36}
        className={cn(ICON_STYLE, className)}
        priority
      />
    ) : (
      <>
        <Image
          src={fullLogoLight}
          alt={alt}
          width={140}
          height={36}
          sizes="140px"
          className={cn(FULL_STYLE, "dark:hidden", className)}
          style={{ width: "auto", height: "auto" }}
          priority
        />
        <Image
          src={fullLogoDark}
          alt={alt}
          width={140}
          height={36}
          sizes="140px"
          className={cn(FULL_STYLE, "hidden dark:inline-block", className)}
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </>
    )

  if (!href) return img

  return (
    <Link href={href} aria-label="BringBucket Home">
      {img}
    </Link>
  )
}
