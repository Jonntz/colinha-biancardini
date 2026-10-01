import { SLOTS } from "@/config/slots";
import { CandidateRow } from "./CandidateRow";

export function CandidateList() {
  return (
    <ol aria-label="Seus candidatos, na ordem de votação da urna" className="mt-98 flex flex-col gap-18">
      {SLOTS.map((slot) => (
        <li key={slot.id}>
          <CandidateRow slot={slot} />
        </li>
      ))}
    </ol>
  );
}
