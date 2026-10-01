import { isPositionId, POSITIONS } from "@/lib/candidates/positions";
import { findCandidate } from "@/lib/candidates/repository";
import type { CandidateLookupResponse } from "@/types/candidate";

const DIGITS = /^\d+$/;

function json(body: CandidateLookupResponse | { error: string }, status: number, cacheControl: string) {
  return Response.json(body, { status, headers: { "Cache-Control": cacheControl } });
}

/**
 * GET /api/candidates/:position/:number
 * Proxy do DivulgaCandContas (evita CORS e o bloqueio do Akamai no navegador) com fallback offline.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/candidates/[position]/[number]">) {
  const { position, number } = await ctx.params;

  if (!isPositionId(position)) {
    return json({ error: "Cargo inválido." }, 400, "no-store");
  }
  const { digits } = POSITIONS[position];
  if (!DIGITS.test(number) || number.length !== digits) {
    return json({ error: `Informe ${digits} dígitos para este cargo.` }, 400, "no-store");
  }

  const { candidate, source } = await findCandidate(position, Number(number));
  // Respostas do snapshot ficam pouco tempo no CDN para voltar logo ao dado ao vivo.
  const cdnTtl = source === "tse" ? 900 : 120;

  if (!candidate) {
    return json({ found: false, source }, 404, `public, max-age=60, s-maxage=${cdnTtl}`);
  }
  return json(
    { found: true, candidate, source },
    200,
    `public, max-age=300, s-maxage=${cdnTtl}, stale-while-revalidate=86400`,
  );
}
