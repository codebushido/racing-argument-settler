import { useMemo, useRef, useState } from "react";
import Phaser from "phaser";
import type { Room } from "colyseus.js";
import { LobbyPanel } from "./components/LobbyPanel";
import { CodeEditor } from "./components/CodeEditor";
import { MatchStatus } from "./components/MatchStatus";
import { GameScene } from "./game/GameScene";
import { bindRoomToScene } from "./game/sync";
import { joinRaceRoom, type ClientWireState } from "./network/colyseusClient";

export default function App() {
  const [roomId, setRoomId] = useState("default");
  const [room, setRoom] = useState<Room<ClientWireState> | null>(null);
  const [code, setCode] = useState("MOVE\nMOVE\nIF AHEAD_IS_WALL THEN RIGHT\nHOP");
  const [snapshot, setSnapshot] = useState<ClientWireState | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  const phase = snapshot?.phase ?? "lobby";

  const onJoin = async () => {
    const joined = await joinRaceRoom(roomId);
    setRoom(joined);
    joined.onStateChange((state) => setSnapshot(structuredClone(state)));

    if (!gameRef.current) {
      const scene = new GameScene();
      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 480,
        height: 480,
        parent: "maze-root",
        backgroundColor: "#111",
        scene,
      });
      bindRoomToScene(joined, scene);
    }
  };

  const onSubmit = () => room?.send("submitProgram", code);

  const creature = useMemo(() => {
    if (!snapshot || !room) return "-";
    return snapshot.players[room.sessionId]?.creature ?? "-";
  }, [snapshot, room]);

  return (
    <main style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16, fontFamily: "sans-serif" }}>
      <div>
        <h1>Code Race</h1>
        <LobbyPanel roomId={roomId} setRoomId={setRoomId} onJoin={onJoin} connected={Boolean(room)} />
        <p>Creature: {creature}</p>
        <CodeEditor code={code} setCode={setCode} onSubmit={onSubmit} disabled={!room || phase === "running"} />
        <MatchStatus phase={phase} tick={snapshot?.tick ?? 0} error={snapshot?.error} result={snapshot?.result} />
      </div>
      <div id="maze-root" />
    </main>
  );
}
