/**
 * app/admin/test-items/page.tsx
 * Research reference: shows the Form A / Form B item pairing table.
 * Protected by the admin middleware (ADMIN_PASSWORD env var).
 * No correctIndex shown — this is safe to display.
 * Spec §6: "Show a table pairing each Form A item with its Form B twin."
 */

import type { Metadata } from "next";
import pretestItems from "@/content/pretest.json";
import posttestItems from "@/content/posttest.json";

export const metadata: Metadata = {
  title: "Test Item Pairing | Admin | Playing Socrates",
};

export default function TestItemsPage() {
  // Pair by index position (both forms have the same concept order)
  const pairs = pretestItems.map((a, i) => ({
    concept: a.concept,
    formA:   a,
    formB:   posttestItems[i],
  }));

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-2">
          Test Item Pairing: Form A ↔ Form B
        </h1>
        <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] mb-8">
          Each row shows the parallel pre-test (Form A) and post-test (Form B) item covering the same concept.
          Correct answers are <strong>not shown</strong> here; they live server-side only.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-[var(--color-outline-variant)]">
          <table className="w-full border-collapse font-[var(--font-body)] text-[length:var(--text-body-sm)]">
            <thead>
              <tr className="bg-[var(--color-surface-container-low)]">
                <th scope="col" className="px-4 py-3 text-left font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-primary)] border-b border-[var(--color-outline-variant)] w-8">
                  #
                </th>
                <th scope="col" className="px-4 py-3 text-left font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)]">
                  Concept
                </th>
                <th scope="col" className="px-4 py-3 text-left font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)]">
                  Form A (Pre-test) — {"{"}ID{"}"}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)]">
                  Form B (Post-test) — {"{"}ID{"}"}
                </th>
              </tr>
            </thead>
            <tbody>
              {pairs.map(({ concept, formA, formB }, idx) => (
                <tr
                  key={formA.id}
                  className={
                    idx % 2 === 0
                      ? "bg-[var(--color-surface)]"
                      : "bg-[var(--color-surface-container-low)]"
                  }
                >
                  <td className="px-4 py-4 text-[var(--color-on-surface-variant)] border-b border-[var(--color-outline-variant)]/40 align-top">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-4 border-b border-[var(--color-outline-variant)]/40 align-top">
                    <span className="inline-block bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-[var(--font-ui)] text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full">
                      {concept}
                    </span>
                  </td>
                  <td className="px-4 py-4 border-b border-[var(--color-outline-variant)]/40 align-top">
                    <p className="font-semibold text-[var(--color-on-surface)] mb-1">
                      [{formA.id}] {formA.question}
                    </p>
                    <ul className="list-none space-y-0.5 mt-2">
                      {formA.options.map((opt, oi) => (
                        <li key={oi} className="text-[var(--color-on-surface-variant)] flex gap-2">
                          <span className="text-[var(--color-outline-variant)] shrink-0">{oi}.</span>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 border-b border-[var(--color-outline-variant)]/40 align-top">
                    <p className="font-semibold text-[var(--color-on-surface)] mb-1">
                      [{formB.id}] {formB.question}
                    </p>
                    <ul className="list-none space-y-0.5 mt-2">
                      {formB.options.map((opt, oi) => (
                        <li key={oi} className="text-[var(--color-on-surface-variant)] flex gap-2">
                          <span className="text-[var(--color-outline-variant)] shrink-0">{oi}.</span>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-[var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-on-surface-variant)]">
          ⚠ Planted errors are on concepts <strong>not tested</strong> in these items (e.g., chlorophyll colour, 
          energy units, enzyme names) — see <code>/lib/plantedErrors.ts</code> for full documentation.
        </p>
      </div>
    </div>
  );
}
