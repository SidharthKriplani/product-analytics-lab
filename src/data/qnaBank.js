// qnaBank.js — PAL QnA interview mode data (QNA-INTERVIEW-STANDARD.md).
// Question IDs are GLOBAL and PERMANENT (frozen at status 'answered') — never renumber or reuse.
// moduleId/beat/level are mutable metadata; IDs deliberately do NOT embed the module.
// Currently EMPTY: every PAL module renders the coming-soon stub. Gate rule: answers are
// only written for modules that are 'clean' in contentStatus.js — PAL has none yet, so
// its first QnA content requires a narrative verification pass first.

export const QNA_BANK = {};

export function qnaForModule(moduleId) {
  return QNA_BANK[moduleId] || null;
}

export function qnaQuestionCount(entry) {
  if (!entry) return 0;
  const inBeats = (entry.beats || []).reduce((n, b) => n + b.questions.length, 0);
  return inBeats + (entry.cases || []).length;
}
