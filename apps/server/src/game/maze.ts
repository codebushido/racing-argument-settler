import { GRID_SIZE, MAX_FAIR_PATH_DELTA, OBSTACLE_COUNT } from "@race/shared";
import type { MazeMap, Position } from "@race/shared";

const mulberry32 = (seed: number) => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const key = (p: Position) => `${p.x},${p.y}`;

export const shortestPathLength = (cells: MazeMap["cells"], start: Position, goal: Position): number => {
  const q: Array<{ p: Position; d: number }> = [{ p: start, d: 0 }];
  const seen = new Set<string>([key(start)]);
  while (q.length) {
    const { p, d } = q.shift()!;
    if (p.x === goal.x && p.y === goal.y) return d;
    const neighbors = [
      { x: p.x + 1, y: p.y },
      { x: p.x - 1, y: p.y },
      { x: p.x, y: p.y + 1 },
      { x: p.x, y: p.y - 1 },
    ];
    for (const n of neighbors) {
      if (n.x < 0 || n.y < 0 || n.x >= GRID_SIZE || n.y >= GRID_SIZE) continue;
      if (cells[n.y][n.x] === "wall" || cells[n.y][n.x] === "obstacle") continue;
      const k = key(n);
      if (seen.has(k)) continue;
      seen.add(k);
      q.push({ p: n, d: d + 1 });
    }
  }
  return -1;
};

const carvePerfectMaze = (seed: number): MazeMap["cells"] => {
  const rand = mulberry32(seed);
  const cells = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => "wall" as const));
  const stack: Position[] = [{ x: 1, y: 1 }];
  cells[1][1] = "floor";

  const dirs = [
    { x: 2, y: 0 },
    { x: -2, y: 0 },
    { x: 0, y: 2 },
    { x: 0, y: -2 },
  ];

  while (stack.length) {
    const cur = stack[stack.length - 1];
    const shuffled = [...dirs].sort(() => rand() - 0.5);
    let carved = false;
    for (const d of shuffled) {
      const nx = cur.x + d.x;
      const ny = cur.y + d.y;
      if (nx <= 0 || ny <= 0 || nx >= GRID_SIZE - 1 || ny >= GRID_SIZE - 1) continue;
      if (cells[ny][nx] !== "wall") continue;
      cells[cur.y + d.y / 2][cur.x + d.x / 2] = "floor";
      cells[ny][nx] = "floor";
      stack.push({ x: nx, y: ny });
      carved = true;
      break;
    }
    if (!carved) stack.pop();
  }

  return cells;
};

export const generateMaze = (seed: number): MazeMap => {
  const rabbitSpawn = { x: 1, y: 1 };
  const frogSpawn = { x: GRID_SIZE - 2, y: GRID_SIZE - 2 };
  const goal = { x: GRID_SIZE - 2, y: 1 };

  for (let attempt = 0; attempt < 100; attempt++) {
    const runSeed = seed + attempt;
    const rand = mulberry32(runSeed);
    const cells = carvePerfectMaze(runSeed).map((row) => [...row]);
    cells[rabbitSpawn.y][rabbitSpawn.x] = "floor";
    cells[frogSpawn.y][frogSpawn.x] = "floor";
    cells[goal.y][goal.x] = "goal";

    let obstaclesPlaced = 0;
    while (obstaclesPlaced < OBSTACLE_COUNT) {
      const x = 1 + Math.floor(rand() * (GRID_SIZE - 2));
      const y = 1 + Math.floor(rand() * (GRID_SIZE - 2));
      if (cells[y][x] !== "floor") continue;
      if ((x === rabbitSpawn.x && y === rabbitSpawn.y) || (x === frogSpawn.x && y === frogSpawn.y)) continue;
      cells[y][x] = "obstacle";
      obstaclesPlaced++;
    }

    const rabbitDist = shortestPathLength(cells, rabbitSpawn, goal);
    const frogDist = shortestPathLength(cells, frogSpawn, goal);
    if (rabbitDist < 0 || frogDist < 0) continue;
    if (Math.abs(rabbitDist - frogDist) > MAX_FAIR_PATH_DELTA) continue;

    return { size: GRID_SIZE, cells, rabbitSpawn, frogSpawn, goal, seed: runSeed };
  }

  throw new Error("Failed to generate fair maze");
};
