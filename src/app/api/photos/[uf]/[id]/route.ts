import { ELECTION } from "@/config/election";
import { TSE_HEADERS, tsePhotoUrl } from "@/lib/candidates/tse";

const ALLOWED_UNITS = new Set<string>(["BR", ELECTION.uf]);
const CANDIDATE_ID = /^\d{6,20}$/;
const PHOTO_TIMEOUT_MS = 8_000;

/**
 * GET /api/photos/:uf/:id
 * Serve a foto do candidato pelo mesmo domínio da aplicação. Sem isso o html-to-image
 * não consegue embutir a imagem do TSE (CORS) e a foto sumiria da colinha baixada.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/photos/[uf]/[id]">) {
  const { uf, id } = await ctx.params;
  if (!ALLOWED_UNITS.has(uf) || !CANDIDATE_ID.test(id)) {
    return new Response("Foto inválida.", { status: 400 });
  }

  const upstream = await fetch(tsePhotoUrl(uf, id), {
    headers: { ...TSE_HEADERS, Accept: "image/avif,image/webp,image/*,*/*;q=0.8" },
    cache: "no-store",
    signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS),
  }).catch(() => null);

  const contentType = upstream?.headers.get("content-type") ?? "";
  if (!upstream?.ok || !contentType.startsWith("image/")) {
    return new Response("Foto indisponível.", {
      status: 404,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
