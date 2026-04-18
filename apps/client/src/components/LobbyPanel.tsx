interface Props {
  roomId: string;
  setRoomId: (roomId: string) => void;
  onJoin: () => void;
  connected: boolean;
}

export function LobbyPanel({ roomId, setRoomId, onJoin, connected }: Props) {
  return (
    <section>
      <h2>Join room</h2>
      <input value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={connected} />
      <button onClick={onJoin} disabled={connected}>
        {connected ? "Connected" : "Join"}
      </button>
    </section>
  );
}
