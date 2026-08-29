/** Store-level guard: synthetic values never leave unless DEMO MODE is on. */
export function assertNoSyntheticLeak(
  rows: { sourceFile?: string; vintage?: string }[],
  demoMode: boolean,
): void {
  if (demoMode) return;
  for (const r of rows) {
    if (r.sourceFile === "DEMO" || r.vintage === "DEMO") {
      throw new Error("DEMO series leaked into production mode");
    }
  }
}
