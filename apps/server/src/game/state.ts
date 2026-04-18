import { GRID_SIZE } from "@race/shared";
import type { Direction, MatchResult, MazeMap, PlayerState, Position } from "@race/shared";

export interface RaceState {
  phase: "lobby" | "running" | "finished";
  maze: MazeMap;
  players: Record<string, PlayerState>;
  tick: number;
  result: MatchResult;
}

export const turnLeft = (direction: Direction): Direction => {
  if (direction === "NORTH") return "WEST";
  if (direction === "WEST") return "SOUTH";
  if (direction === "SOUTH") return "EAST";
  return "NORTH";
};

export const turnRight = (direction: Direction): Direction => {
  if (direction === "NORTH") return "EAST";
  if (direction === "EAST") return "SOUTH";
  if (direction === "SOUTH") return "WEST";
  return "NORTH";
};

export const stepForward = ({ x, y }: Position, direction: Direction): Position => {
  if (direction === "NORTH") return { x, y: y - 1 };
  if (direction === "SOUTH") return { x, y: y + 1 };
  if (direction === "EAST") return { x: x + 1, y };
  return { x: x - 1, y };
};

export const inBounds = ({ x, y }: Position) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
