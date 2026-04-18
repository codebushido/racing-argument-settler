import type { MazeMap, PlayerState, Position, SimpleOpcode } from "@race/shared";
import { inBounds, stepForward, turnLeft, turnRight } from "./state";

export interface PlannedAction {
  type: "move" | "turn" | "wait";
  op: SimpleOpcode;
  target?: Position;
  path?: Position[];
}

const equalPos = (a: Position, b: Position) => a.x === b.x && a.y === b.y;

const isBlocked = (maze: MazeMap, pos: Position, occupied: Position[]) => {
  if (!inBounds(pos)) return true;
  const cell = maze.cells[pos.y][pos.x];
  if (cell === "wall" || cell === "obstacle") return true;
  return occupied.some((o) => equalPos(o, pos));
};

export const planAction = (maze: MazeMap, player: PlayerState, op: SimpleOpcode, occupied: Position[]): PlannedAction => {
  if (op === "LEFT" || op === "RIGHT") return { type: "turn", op };
  if (op === "WAIT") return { type: "wait", op };

  if (op === "MOVE") {
    const target = stepForward(player.position, player.direction);
    if (isBlocked(maze, target, occupied)) return { type: "wait", op: "WAIT" };
    return { type: "move", op, target, path: [target] };
  }

  const first = stepForward(player.position, player.direction);
  const second = stepForward(first, player.direction);
  if (isBlocked(maze, first, occupied) || isBlocked(maze, second, occupied)) return { type: "wait", op: "WAIT" };
  return { type: "move", op, target: second, path: [first, second] };
};

export const resolveActions = (
  maze: MazeMap,
  rabbit: PlayerState,
  rabbitAction: PlannedAction,
  frog: PlayerState,
  frogAction: PlannedAction,
) => {
  const nextRabbit = { ...rabbit, position: { ...rabbit.position } };
  const nextFrog = { ...frog, position: { ...frog.position } };

  if (rabbitAction.type === "turn") {
    nextRabbit.direction = rabbitAction.op === "LEFT" ? turnLeft(rabbit.direction) : turnRight(rabbit.direction);
  }
  if (frogAction.type === "turn") {
    nextFrog.direction = frogAction.op === "LEFT" ? turnLeft(frog.direction) : turnRight(frog.direction);
  }

  const rabbitTarget = rabbitAction.target;
  const frogTarget = frogAction.target;
  const bothMove = rabbitAction.type === "move" && frogAction.type === "move";

  if (bothMove && rabbitTarget && frogTarget) {
    const sameTarget = equalPos(rabbitTarget, frogTarget);
    const crossSwap = equalPos(rabbitTarget, frog.position) && equalPos(frogTarget, rabbit.position);
    if (!sameTarget && !crossSwap) {
      nextRabbit.position = rabbitTarget;
      nextFrog.position = frogTarget;
    }
  } else {
    if (rabbitAction.type === "move" && rabbitTarget && !equalPos(rabbitTarget, frog.position)) {
      nextRabbit.position = rabbitTarget;
    }
    if (frogAction.type === "move" && frogTarget && !equalPos(frogTarget, rabbit.position)) {
      nextFrog.position = frogTarget;
    }
  }

  const rabbitGoal = equalPos(nextRabbit.position, maze.goal);
  const frogGoal = equalPos(nextFrog.position, maze.goal);

  return { nextRabbit, nextFrog, rabbitGoal, frogGoal };
};
