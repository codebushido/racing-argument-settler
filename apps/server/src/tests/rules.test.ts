import { describe, expect, it } from "vitest";
import type { MazeMap, PlayerState } from "@race/shared";
import { planAction, resolveActions } from "../game/rules";

const maze: MazeMap = {
  size: 5,
  seed: 1,
  rabbitSpawn: { x: 1, y: 1 },
  frogSpawn: { x: 3, y: 3 },
  goal: { x: 4, y: 4 },
  cells: [
    ["wall", "wall", "wall", "wall", "wall"],
    ["wall", "floor", "floor", "floor", "wall"],
    ["wall", "floor", "floor", "floor", "wall"],
    ["wall", "floor", "floor", "floor", "wall"],
    ["wall", "wall", "wall", "wall", "goal"],
  ],
};

const basePlayer: PlayerState = {
  id: "p",
  creature: "rabbit",
  position: { x: 1, y: 1 },
  direction: "EAST",
  program: [],
  pc: 0,
  submitted: false,
};

describe("rules", () => {
  it("blocks moving into same tile", () => {
    const rabbit = { ...basePlayer, id: "r", position: { x: 1, y: 1 }, direction: "EAST" };
    const frog = { ...basePlayer, id: "f", creature: "frog", position: { x: 3, y: 1 }, direction: "WEST" };

    const rabbitAction = planAction(maze, rabbit, "MOVE", [frog.position]);
    const frogAction = planAction(maze, frog, "MOVE", [rabbit.position]);

    const result = resolveActions(maze, rabbit, rabbitAction, frog, frogAction);
    expect(result.nextRabbit.position).toEqual({ x: 1, y: 1 });
    expect(result.nextFrog.position).toEqual({ x: 3, y: 1 });
  });
});
