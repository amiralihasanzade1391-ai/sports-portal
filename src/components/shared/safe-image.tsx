"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=60";

/**
 * SafeImage Component
 * - Uses unoptimized={true} for external RSS / CDN images to completely bypass Next.js hostname errors.
 * - Handles broken links / HTTP 404s gracefully via automatic fallback.
 * - Supports all standard next/image props (fill, sizes, priority, etc.).
 */
export function SafeImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  unoptimized,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    typeof src === "string" && src.trim() ? src : fallbackSrc
  );
  const [hasError, setHasError] = useState(false);

  const isExternal =
    typeof imgSrc === "string" &&
    (imgSrc.startsWith("http://") || imgSrc.startsWith("https://"));

  return (
    <Image
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt || "Sports Portal Media"}
      className={className}
      // External images are marked unoptimized to prevent any remotePattern hostname crash
      unoptimized={unoptimized ?? isExternal}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
      {...props}
    />
  );
}
