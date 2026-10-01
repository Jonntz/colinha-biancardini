"use client";

import { useCallback, useRef, useState, type RefObject } from "react";
import { captureColinha } from "@/lib/export/capture";
import { canShareFile, downloadBlob, saveImage, shareFile, toImageFile, type SaveOutcome } from "@/lib/export/save";

export type ExportStatus =
  | { phase: "idle" }
  | { phase: "working" }
  | { phase: "done"; outcome: SaveOutcome }
  | { phase: "error"; message: string };

export interface ExportPreview {
  url: string;
  file: File;
  canShare: boolean;
}

export const EXPORT_FILE_NAME = "minha-colinha-2026.png";

/** Gera a imagem da colinha e entrega ao aparelho (galeria, downloads ou prévia manual). */
export function useColinhaExport(captureRef: RefObject<HTMLElement | null>) {
  const [status, setStatus] = useState<ExportStatus>({ phase: "idle" });
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const previewRef = useRef<ExportPreview | null>(null);
  const lastBlobRef = useRef<Blob | null>(null);

  const closePreview = useCallback(() => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    previewRef.current = null;
    setPreview(null);
  }, []);

  const openPreview = useCallback((blob: Blob) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current.url);
    const file = toImageFile(blob, EXPORT_FILE_NAME);
    const next = { url: URL.createObjectURL(blob), file, canShare: canShareFile(file) };
    previewRef.current = next;
    setPreview(next);
  }, []);

  const exportImage = useCallback(async () => {
    const node = captureRef.current;
    if (!node) return;

    setStatus({ phase: "working" });
    try {
      const blob = await captureColinha(node);
      lastBlobRef.current = blob;
      const outcome = await saveImage(blob, EXPORT_FILE_NAME);
      if (outcome === "manual") openPreview(blob);
      setStatus({ phase: "done", outcome });
    } catch (error) {
      console.error("[colinha] falha ao exportar a imagem", error);
      setStatus({ phase: "error", message: "Não foi possível gerar a imagem. Tente novamente." });
    }
  }, [captureRef, openPreview]);

  /** Reabre a última imagem gerada (útil quando o navegador não mostra o download). */
  const showLastImage = useCallback(() => {
    if (lastBlobRef.current) openPreview(lastBlobRef.current);
  }, [openPreview]);

  const shareFromPreview = useCallback(async () => {
    const current = previewRef.current;
    if (!current) return;
    try {
      await shareFile(current.file);
    } catch {
      downloadBlob(current.file, EXPORT_FILE_NAME);
    }
  }, []);

  const downloadFromPreview = useCallback(() => {
    const current = previewRef.current;
    if (current) downloadBlob(current.file, EXPORT_FILE_NAME);
  }, []);

  return { status, preview, exportImage, showLastImage, closePreview, shareFromPreview, downloadFromPreview };
}
