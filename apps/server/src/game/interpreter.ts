import type { Instruction, PlayerState } from "@race/shared";
import { stepForward } from "./state";

export const nextOpcode = (player: PlayerState, cells: ("wall" | "floor" | "obstacle" | "goal")[][]) => {
  const ins: Instruction | undefined = player.program[player.pc];
  if (!ins) return null;

  if (ins.kind === "command") return ins.op;

  const ahead = stepForward(player.position, player.direction);
  const isWall =
    ahead.y < 0 || ahead.x < 0 || ahead.y >= cells.length || ahead.x >= cells[0].length || cells[ahead.y][ahead.x] === "wall";
  return isWall ? ins.then.op : "WAIT";
};
