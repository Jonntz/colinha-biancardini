export type SaveOutcome = "downloaded" | "shared" | "cancelled" | "manual";

/** Navegadores internos de apps costumam bloquear downloads. */
const IN_APP_BROWSER = /FBAN|FBAV|FB_IAB|Instagram|Line\/|LinkedInApp|TikTok|musical_ly|Snapchat|Twitter/i;

function isIOS(): boolean {
  const ua = navigator.userAgent;
  // iPadOS se apresenta como Mac; o toque denuncia o tablet.
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
}

export function toImageFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type || "image/png" });
}

export function canShareFile(file: File): boolean {
  return typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });
}

export async function shareFile(file: File): Promise<"shared" | "cancelled"> {
  try {
    await navigator.share({ files: [file], title: "Minha colinha" });
    return "shared";
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    throw error;
  }
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement("a"), { href: url, download: fileName, rel: "noopener" });
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Salva a colinha no aparelho:
 * - iOS: só a folha de compartilhamento ("Salvar imagem") grava direto na galeria de Fotos;
 * - Android e desktop: download direto do PNG;
 * - navegadores de apps (Instagram, Facebook…): "manual" → a interface mostra a prévia para salvar.
 */
export async function saveImage(blob: Blob, fileName: string): Promise<SaveOutcome> {
  if (IN_APP_BROWSER.test(navigator.userAgent)) return "manual";

  const file = toImageFile(blob, fileName);
  if (isIOS() && canShareFile(file)) {
    try {
      return await shareFile(file);
    } catch {
      // Ex.: NotAllowedError quando o gesto do usuário expira enquanto a imagem é gerada.
      return "manual";
    }
  }

  downloadBlob(blob, fileName);
  return "downloaded";
}
