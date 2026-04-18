import { Client, Room } from "colyseus.js";

export interface ClientWireState {
  phase: string;
  tick: number;
  error?: string;
  result?: { winner: string | null; reason: string | null };
  maze: {
    size: number;
    cells: string[][];
    goal: { x: number; y: number };
  };
  players: Record<
    string,
    {
      id: string;
      creature: "rabbit" | "frog";
      position: { x: number; y: number };
      direction: string;
      submitted: boolean;
    }
  >;
}

export const createClient = (endpoint = "ws://localhost:2567") => new Client(endpoint);

export const joinRaceRoom = async (roomId = "default") => {
  const client = createClient();
  const room = await client.joinOrCreate<ClientWireState>("race", { roomId });
  return room as Room<ClientWireState>;
};
