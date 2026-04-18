import { describe, expect, it } from "vitest";
import { generateMaze, shortestPathLength } from "../game/maze";

describe("maze generation", () => {
  it("is deterministic by seed", () => {
    const a = generateMaze(42);
    const b = generateMaze(42);
    expect(a.cells).toEqual(b.cells);
  });

  it("keeps both spawns reachable", () => {
    const maze = generateMaze(99);
    const rabbit = shortestPathLength(maze.cells, maze.rabbitSpawn, maze.goal);
    const frog = shortestPathLength(maze.cells, maze.frogSpawn, maze.goal);
    expect(rabbit).toBeGreaterThan(0);
    expect(frog).toBeGreaterThan(0);
  });
});
