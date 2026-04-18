import type { Instruction } from "./instructions";

export type Direction = "NORTH" | "EAST" | "SOUTH" | "WEST";
export type Creature = "rabbit" | "frog";
export type GamePhase = "lobby" | "programming" | "running" | "finished";

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  id: string;
  creature: Creature;
  position: Position;
  direction: Direction;
  program: Instruction[];
  pc: number;
  submitted: boolean;
}

export type CellType = "wall" | "floor" | "obstacle" | "goal";

export interface MazeMap {
  size: number;
  cells: CellType[][];
  rabbitSpawn: Position;
  frogSpawn: Position;
  goal: Position;
  seed: number;
}

export interface MatchResult {
  winner: Creature | "draw" | null;
  reason: "goal" | "program-end" | "waiting" | null;
}
