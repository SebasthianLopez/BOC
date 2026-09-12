/**
 * Los tipos que consume la pagina, ahora desde el carril de P3.
 *
 * Este archivo era un espejo temporal de `PROYECTO.md` mientras P3 no existia.
 * Ahora que `apps/web/src/lib/decisions.ts` esta integrado, solo reexporta:
 * una sola fuente de verdad, y los componentes no cambian de import.
 *
 * `DecisionWorkplace` se deriva del hook real, asi que si P3 cambia su forma
 * el typecheck lo marca aca en vez de fallar en runtime.
 */
import type { useDecisionWorkplace } from "@/lib/use-decision-workplace";

export type {
  Alternative,
  Criterion,
  Decision,
  Evidence,
  Gap,
  Proposal,
} from "@/lib/decisions";

export type { Commitment, CommitmentsStatus } from "@/lib/followup-types";

export type DecisionWorkplace = ReturnType<typeof useDecisionWorkplace>;
