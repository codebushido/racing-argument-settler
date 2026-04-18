interface Props {
  phase: string;
  tick: number;
  error?: string;
  result?: { winner: string | null; reason: string | null };
}

export function MatchStatus({ phase, tick, error, result }: Props) {
  return (
    <section>
      <h2>Status</h2>
      <p>Phase: {phase}</p>
      <p>Tick: {tick}</p>
      {error ? <p style={{ color: "crimson" }}>Error: {error}</p> : null}
      {result ? <p>Result: {result.winner ?? "pending"}</p> : null}
    </section>
  );
}
