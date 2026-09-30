/**
 * app/admin/test-items/page.tsx
 * Research reference: shows the Pre-Test / Post-Test item pairing table across Set A and Set B.
 * Protected by the admin middleware (ADMIN_PASSWORD env var).
 * No correctIndex shown — this is safe to display.
 * Spec §6 / TOPICS.md §2: "Show a table pairing each pre-test item with its post-test twin."
 */

import type { Metadata } from "next";
import pretestItems from "@/content/pretest.json";
import posttestItems from "@/content/posttest.json";
import { getTopicDisplayName } from "@/config/study";

export const metadata: Metadata = {
  title: "Test Item Pairing | Admin | Playing Socrates",
};

export default function TestItemsPage() {
  const pairs: Array<{
    topicName: string;
    topicId: string;
    concept: string;
    preItem: { id: string; question: string; options: string[]; concept: string };
    postItem: { id: string; question: string; options: string[]; concept: string } | undefined;
  }> = [];

  for (const preTopic of pretestItems as Array<{ topicId: string; pretest: any[] }>) {
    const postTopic = (posttestItems as Array<{ topicId: string; posttest: any[] }>).find(
      (p) => p.topicId === preTopic.topicId
    );
    const preList = preTopic.pretest || [];
    const postList = postTopic?.posttest || [];

    for (const pre of preList) {
      const post = postList.find((p) => p.concept === pre.concept);
      pairs.push({
        topicName: getTopicDisplayName(preTopic.topicId),
        topicId: preTopic.topicId,
        concept: pre.concept,
        preItem: {
          id: pre.itemId || pre.id,
          question: pre.question,
          options: pre.options,
          concept: pre.concept,
        },
        postItem: post
          ? {
              id: post.itemId || post.id,
              question: post.question,
              options: post.options,
              concept: post.concept,
            }
          : undefined,
      });
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-[var(--font-display)] text-[length:var(--text-headline-lg)] font-bold text-[var(--color-on-surface)] mb-2">
          Test Item Pairing: Pre-test ↔ Post-test (5 Items per Topic)
        </h1>
        <p className="font-[var(--font-body)] text-[length:var(--text-body-md)] text-[var(--color-on-surface-variant)] mb-8">
          Each row shows the parallel pre-test and post-test items covering the same topic sub-concept (25 pairs total).
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
                  Topic & Concept
                </th>
                <th scope="col" className="px-4 py-3 text-left font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)]">
                  Pre-test Question — {"{"}ID{"}"}
                </th>
                <th scope="col" className="px-4 py-3 text-left font-[var(--font-ui)] text-[length:var(--text-label-md)] text-[var(--color-on-surface)] border-b border-[var(--color-outline-variant)]">
                  Post-test Question — {"{"}ID{"}"}
                </th>
              </tr>
            </thead>
            <tbody>
              {pairs.map(({ topicName, concept, preItem, postItem }, idx) => (
                <tr
                  key={preItem.id}
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
                    <span className="inline-block bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-[var(--font-ui)] text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1">
                      {concept}
                    </span>
                    <p className="font-medium text-[var(--color-on-surface)] text-[length:var(--text-body-sm)]">
                      {topicName}
                    </p>
                  </td>
                  <td className="px-4 py-4 border-b border-[var(--color-outline-variant)]/40 align-top">
                    <p className="font-semibold text-[var(--color-on-surface)] mb-1">
                      [{preItem.id}] {preItem.question}
                    </p>
                    <ul className="list-none space-y-0.5 mt-2">
                      {preItem.options.map((opt, oi) => (
                        <li key={oi} className="text-[var(--color-on-surface-variant)] flex gap-2">
                          <span className="text-[var(--color-outline-variant)] shrink-0">{String.fromCharCode(65 + oi)}.</span>
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-4 border-b border-[var(--color-outline-variant)]/40 align-top">
                    {postItem && (
                      <>
                        <p className="font-semibold text-[var(--color-on-surface)] mb-1">
                          [{postItem.id}] {postItem.question}
                        </p>
                        <ul className="list-none space-y-0.5 mt-2">
                          {postItem.options.map((opt, oi) => (
                            <li key={oi} className="text-[var(--color-on-surface-variant)] flex gap-2">
                              <span className="text-[var(--color-outline-variant)] shrink-0">{String.fromCharCode(65 + oi)}.</span>
                              {opt}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
