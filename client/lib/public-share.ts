"use client"

const BACKEND = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(":3000", ":4000")
  : "http://localhost:4000"

export type PublicShareResponse =
  | {
      kind: "file"
      fileName: string
      fileType: string | null
      fileSize: number
      allowDownload: boolean
      previewUrl: string
      downloadUrl?: string
    }
  | {
      kind: "folder"
      folderName: string
      itemCount: number
      allowDownload: boolean
      items: Array<{
        id: string
        name: string
        size: number
        mimeType: string | null
        relativePath: string
        downloadUrl?: string
      }>
    }

export interface PublicShareError {
  status: number
  code?: string
  message: string
}

export async function accessPublicShareLink(
  slug: string,
  password?: string,
): Promise<PublicShareResponse> {
  const headers: Record<string, string> = {}
  if (password) headers["x-share-password"] = password

  const res = await fetch(`${BACKEND}/s/${slug}`, { headers, credentials: "include" })

  if (!res.ok) {
    let message = "Failed to access share link"
    let code: string | undefined
    try {
      const body = await res.json()
      if (body?.error) {
        message = body.error.message ?? message
        code = body.error.code
      }
    } catch {}
    throw Object.assign(new Error(message), {
      status: res.status,
      code,
    })
  }

  return res.json()
}
