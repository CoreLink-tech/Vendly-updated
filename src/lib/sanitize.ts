/**
 * PostgREST's .or() takes a raw filter string where commas separate
 * conditions and parentheses are used for grouping/negation. If raw user
 * input is interpolated directly into that string, a search value
 * containing those characters can inject additional filter conditions
 * instead of just being searched for literally.
 *
 * This strips the characters that have syntactic meaning in that grammar
 * so the value can only ever be searched for, never used to alter the
 * query structure. Safe to use inside `.or(...)` and `.ilike(...)` alike.
 */
export function sanitizeSearchInput(raw: string): string {
  return raw
    .replace(/[,()]/g, '')
    .trim()
    .slice(0, 100);
}
