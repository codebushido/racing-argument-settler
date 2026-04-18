interface Props {
  code: string;
  setCode: (code: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function CodeEditor({ code, setCode, onSubmit, disabled }: Props) {
  return (
    <section>
      <h2>Program</h2>
      <textarea rows={10} cols={40} value={code} onChange={(e) => setCode(e.target.value)} disabled={disabled} />
      <br />
      <button onClick={onSubmit} disabled={disabled}>
        Submit Program
      </button>
      <p>Commands: MOVE, LEFT, RIGHT, WAIT, HOP, IF AHEAD_IS_WALL THEN RIGHT</p>
    </section>
  );
}
