"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { usePreviewUrl } from "@/lib/files";
import { Skeleton } from "@/components/ui/skeleton";

interface FileThumbnailProps {
  workspaceId: string | undefined;
  fileId: string;
  mimeType: string | null | undefined;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallback: React.ReactNode;
  /** Pre-fetched URL from a batch call */
  previewUrl?: string;
  /**
   * When true, individual usePreviewUrl is never called — the parent owns fetching.
   * Use alongside previewUrl in batch-fetch contexts (e.g. gallery page).
   */
  skipFetch?: boolean;
  /** Render the image at its natural dimensions instead of filling a fixed container */
  natural?: boolean;
}

export function FileThumbnail({
  workspaceId,
  fileId,
  mimeType,
  alt,
  className,
  imgClassName,
  fallback,
  previewUrl,
  skipFetch = false,
  natural = false,
}: FileThumbnailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const isImage = !!mimeType?.startsWith("image/");

  useEffect(() => {
    if (!ref.current || !isImage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isImage]);

  // Individual fetch disabled when skipFetch is true (batch mode) or a URL is already provided
  const { data, isLoading } = usePreviewUrl(workspaceId, fileId, mimeType, !skipFetch && !previewUrl && inView);

  const handleError = useCallback(() => setImgError(true), []);
  const handleLoad = useCallback(() => setImgLoaded(true), []);

  const resolvedUrl = previewUrl ?? data?.url;
  // In batch mode, gate rendering on inView so images outside viewport don't download
  const hasPreview = isImage && !imgError && !!resolvedUrl && (skipFetch ? inView : true);
  const showSkeleton = isImage && inView && !imgLoaded && !imgError && (
    skipFetch ? !resolvedUrl : isLoading
  );

  if (natural) {
    return (
      <div ref={ref} className={cn("overflow-hidden", className)}>
        {hasPreview ? (
          <>
            {showSkeleton && !imgLoaded && <Skeleton className="h-28 w-full rounded-none" />}
            <img
              src={resolvedUrl}
              alt={alt}
              onError={handleError}
              onLoad={handleLoad}
              className={cn(
                "block w-full h-auto transition-opacity duration-300",
                imgLoaded ? "opacity-100" : "opacity-0 absolute inset-0",
                imgClassName,
              )}
            />
          </>
        ) : (
          <div className="h-28 w-full">{fallback}</div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {showSkeleton && <Skeleton className="absolute inset-0 rounded-none" />}

      {hasPreview && (
        <img
          src={resolvedUrl}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            imgLoaded ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}

      <div
        className={cn(
          "flex h-full w-full items-center justify-center transition-opacity duration-300",
          hasPreview && imgLoaded ? "opacity-0 pointer-events-none" : "opacity-100",
        )}
      >
        {fallback}
      </div>
    </div>
  );
}
