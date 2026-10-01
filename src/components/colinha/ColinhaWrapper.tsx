"use client";

import type { ReactNode } from "react";
import { useColinha } from "@/context/ColinhaContext";

/**
 * Área capturada no download. Tudo aqui dentro é medido em "u" (1/1080 da largura),
 * então a colinha mantém as proporções do layout original em qualquer tela.
 */
export function ColinhaWrapper({ children }: { children: ReactNode }) {
  const {
    meta: { captureRef },
  } = useColinha();
  return (
    <div ref={captureRef} className="colinha flex min-h-1920 flex-col bg-navy px-72 font-sans text-navy antialiased">
      {children}
    </div>
  );
}
