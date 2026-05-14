import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

import fullLogo from "@/public/bringbucket.png"
import iconLogo from "@/public/bringbutket-logo.png"

type LogoProps = {
  variant?: "icon" | "full"
  href?: string
  className?: string
}

export function Logo({
  variant = "full",
  href = "/",
  className,
}: LogoProps) {
  const src = variant === "icon" ? iconLogo : fullLogo
  const alt = variant === "icon" ? "BringBucket" : "BringBucket"

  const img = (
    <Image
      src={src}
      alt={alt}
      width={variant === "icon" ? 36 : 140}
      height={variant === "icon" ? 36 : 36}
      className={cn("h-auto", variant === "icon" ? "w-9" : "w-[140px]", className)}
      priority
    />
  )

  if (!href) return img

  return (
    <Link href={href} aria-label="BringBucket Home">
      {img}
    </Link>
  )
}
