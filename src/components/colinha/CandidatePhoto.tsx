"use client";

import { useState } from "react";
import { initialsOf } from "@/lib/candidates/format";

interface CandidatePhotoProps {
  src: string | null;
  name: string;
}

/** Foto 150 × 184 com cantos arredondados; sem foto (ou se ela falhar), mostra as iniciais. */
export function CandidatePhoto({ src, name }: CandidatePhotoProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPhoto = src !== null && src !== failedSrc;

  return (
    <div className="relative h-184 w-150 shrink-0 overflow-hidden rounded-c-photo bg-white/70">
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- a exportação (html-to-image) precisa de <img> same-origin e sem lazy loading
        <img
          src={src}
          alt={`Foto de ${name}`}
          width={150}
          height={184}
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <span aria-hidden className="flex h-full w-full items-center justify-center bg-navy text-c-name font-black text-brand-yellow">
          {initialsOf(name)}
        </span>
      )}
    </div>
  );
}
