"use client";

import { useState } from "react";
import Image from "next/image";
import { getTeamLogoUrl } from "@/lib/sports-data";

interface TeamBadgeProps {
  name: string;
  logo: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function TeamBadge({ name, logo, size = "md", className = "" }: TeamBadgeProps) {
  const [hasError, setHasError] = useState(false);

  const resolvedLogoUrl =
    logo?.startsWith("http://") || logo?.startsWith("https://") || logo?.startsWith("/")
      ? logo
      : getTeamLogoUrl(name);

  const dimensionMap = {
    xs: { box: "h-5 w-5", img: 16, text: "text-xs" },
    sm: { box: "h-6 w-6", img: 20, text: "text-sm" },
    md: { box: "h-8 w-8", img: 28, text: "text-base" },
    lg: { box: "h-12 w-12", img: 42, text: "text-2xl" },
  };

  const dim = dimensionMap[size];

  if (resolvedLogoUrl && !hasError) {
    return (
      <div
        className={`relative ${dim.box} shrink-0 flex items-center justify-center rounded-md p-0.5 ${className}`}
      >
        <Image
          src={resolvedLogoUrl}
          alt={name}
          width={dim.img}
          height={dim.img}
          className="object-contain h-full w-full drop-shadow-xs"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 flex items-center justify-center leading-none ${dim.box} ${dim.text} ${className}`}
    >
      <span>{logo || "⚽"}</span>
    </div>
  );
}
