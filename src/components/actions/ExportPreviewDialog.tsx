"use client";

interface ExportPreviewDialogProps {
  imageUrl: string;
  canShare: boolean;
  onShare: () => void;
  onDownload: () => void;
  onClose: () => void;
}

/**
 * Plano B da exportação: navegadores de apps (Instagram, Facebook…) e iPhones em que o
 * compartilhamento expira mostram a imagem para o eleitor salvar com um toque longo.
 */
export function ExportPreviewDialog({ imageUrl, canShare, onShare, onDownload, onClose }: ExportPreviewDialogProps) {
  return (
    <dialog
      ref={(dialog) => {
        if (dialog && !dialog.open) dialog.showModal();
      }}
      onClose={onClose}
      aria-labelledby="preview-title"
      className="m-auto max-h-[92dvh] w-[min(92vw,26rem)] overflow-y-auto rounded-3xl bg-white p-5 text-navy shadow-2xl backdrop:bg-black/75"
    >
      <h2 id="preview-title" className="text-lg font-black">
        Sua colinha está pronta!
      </h2>
      <p className="mt-1 text-sm text-slate-600">Toque e segure a imagem para salvar na galeria ou use os botões abaixo.</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- blob: gerado no navegador */}
      <img src={imageUrl} alt="Prévia da sua colinha" className="mt-4 w-full rounded-xl shadow-md" />
      <div className="mt-4 grid gap-2">
        {canShare ? (
          <button type="button" onClick={onShare} className="h-12 rounded-xl bg-navy font-extrabold text-brand-yellow">
            Salvar na galeria
          </button>
        ) : null}
        <button
          type="button"
          onClick={onDownload}
          className={canShare ? "h-12 rounded-xl border border-navy/20 font-bold" : "h-12 rounded-xl bg-navy font-extrabold text-brand-yellow"}
        >
          Baixar PNG
        </button>
        <form method="dialog">
          <button className="h-11 w-full rounded-xl font-bold text-slate-600">Fechar</button>
        </form>
      </div>
    </dialog>
  );
}
