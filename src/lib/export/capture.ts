import type * as HtmlToImage from "html-to-image";
import { EXPORT_IGNORE_ATTRIBUTE } from "./ignore";

type CaptureOptions = NonNullable<Parameters<typeof HtmlToImage.toBlob>[1]>;

/** Largura final da imagem: formato stories (1080 × 1920 com a colinha no estado inicial). */
export const EXPORT_WIDTH = 1080;
const BACKGROUND_COLOR = "#052e3f";

const loadHtmlToImage = () => import("html-to-image");
let fontEmbedCss: Promise<string> | null = null;

/** Pré-carrega o módulo de exportação (hover/foco no botão) para o clique responder rápido. */
export function preloadExporter(): void {
  void loadHtmlToImage();
}

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** WebKit (Safari e todo navegador no iOS) às vezes desenha a 1ª captura sem fotos/fontes. */
function isWebKit(): boolean {
  const ua = navigator.userAgent;
  return /AppleWebKit/i.test(ua) && !/Chrome|Chromium|Android/i.test(ua);
}

async function waitForAssets(node: HTMLElement): Promise<void> {
  await document.fonts.ready;
  await Promise.all(Array.from(node.querySelectorAll("img"), (img) => img.decode().catch(() => undefined)));
}

/** "Tira o print" só da área da colinha e devolve um PNG com 1080 px de largura. */
export async function captureColinha(node: HTMLElement): Promise<Blob> {
  const [{ toBlob, getFontEmbedCSS }] = await Promise.all([loadHtmlToImage(), waitForAssets(node)]);

  // Remove o estado de foco (caixa ativa/cursor) antes da captura.
  if (document.activeElement instanceof HTMLElement && node.contains(document.activeElement)) {
    document.activeElement.blur();
  }
  await nextFrame();

  const options: CaptureOptions = {
    pixelRatio: EXPORT_WIDTH / node.getBoundingClientRect().width,
    backgroundColor: BACKGROUND_COLOR,
    filter: (element) => !(element instanceof Element && element.hasAttribute(EXPORT_IGNORE_ATTRIBUTE)),
  };

  // As fontes (Montserrat e Rubik) são embutidas uma vez e reaproveitadas nas próximas exportações.
  fontEmbedCss ??= getFontEmbedCSS(node, options).catch((error: unknown) => {
    fontEmbedCss = null;
    throw error;
  });
  options.fontEmbedCSS = await fontEmbedCss;

  if (isWebKit()) await toBlob(node, options);
  const blob = await toBlob(node, options);
  if (!blob) throw new Error("html-to-image não gerou a imagem.");
  return blob;
}
