"use client";

import { EDITABLE_SLOTS } from "@/config/slots";
import { useColinha } from "@/context/ColinhaContext";
import { useColinhaExport, type ExportStatus } from "@/hooks/useColinhaExport";
import { preloadExporter } from "@/lib/export/capture";
import { ExportPreviewDialog } from "./ExportPreviewDialog";
import { DownloadIcon, SpinnerIcon } from "./icons";

function statusMessage(status: ExportStatus): string {
  if (status.phase === "error") return status.message;
  if (status.phase !== "done") return "";
  switch (status.outcome) {
    case "downloaded":
      return "Pronto! A colinha foi baixada no seu aparelho.";
    case "shared":
      return "Pronto! Sua colinha foi salva.";
    case "manual":
      return "Toque e segure a imagem para salvar na galeria.";
    case "cancelled":
      return "";
  }
}

/** Botões "Baixar Colinha" e "Limpar": barra fixa no celular, coluna lateral no desktop. */
export function ColinhaActions() {
  const { state, actions, meta } = useColinha();
  const { status, preview, exportImage, showLastImage, closePreview, shareFromPreview, downloadFromPreview } =
    useColinhaExport(meta.captureRef);
  const working = status.phase === "working";
  const hasTypedNumbers = EDITABLE_SLOTS.some((slot) => state[slot.id].digits !== "");
  const message = statusMessage(status);

  function handleReset() {
    if (window.confirm("Apagar os números que você digitou?")) actions.reset();
  }

  return (
    <div className="sticky bottom-0 z-10 border-t border-white/10 bg-navy/95 px-4 pt-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur-sm sm:bg-navy-950/95 lg:static lg:col-start-1 lg:row-start-2 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <div className="mx-auto flex max-w-[480px] gap-3 lg:mx-0">
        <button
          type="button"
          onClick={exportImage}
          onPointerEnter={preloadExporter}
          onPointerDown={preloadExporter}
          onFocus={preloadExporter}
          disabled={working}
          aria-busy={working}
          className="inline-flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-brand-yellow px-6 text-base font-extrabold text-navy shadow-lg shadow-black/25 transition hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[0.98] disabled:cursor-progress disabled:opacity-80"
        >
          {working ? <SpinnerIcon className="size-5 animate-spin" /> : <DownloadIcon className="size-5" />}
          {working ? "Gerando imagem…" : "Baixar Colinha"}
        </button>
        {hasTypedNumbers ? (
          <button
            type="button"
            onClick={handleReset}
            className="h-14 rounded-2xl border border-white/20 px-5 text-sm font-bold text-white/90 transition hover:bg-white/10 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Limpar
          </button>
        ) : null}
      </div>
      <p role="status" className="mx-auto max-w-[480px] text-center text-sm text-white/80 empty:hidden lg:mx-0 lg:mt-3 lg:text-left [&:not(:empty)]:mt-2">
        {message}
        {status.phase === "done" && status.outcome === "downloaded" ? (
          <button type="button" onClick={showLastImage} className="ml-1 font-bold text-brand-yellow underline underline-offset-2">
            Ver imagem
          </button>
        ) : null}
      </p>
      {preview ? (
        <ExportPreviewDialog
          imageUrl={preview.url}
          canShare={preview.canShare}
          onShare={shareFromPreview}
          onDownload={downloadFromPreview}
          onClose={closePreview}
        />
      ) : null}
    </div>
  );
}
