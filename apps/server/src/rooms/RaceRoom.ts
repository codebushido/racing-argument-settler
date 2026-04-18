import { Room } from "colyseus";
import { DEFAULT_TICK_RATE } from "@race/shared";
import type { Creature, GamePhase, MatchResult, PlayerState } from "@race/shared";
import { generateMaze } from "../game/maze";
import { nextOpcode } from "../game/interpreter";
import { parseProgram } from "../game/parser";
import { planAction, resolveActions } from "../game/rules";

export interface WireState {
  phase: GamePhase;
  maze: ReturnType<typeof generateMaze>;
  tick: number;
  result: MatchResult;
  players: Record<string, PlayerState>;
  error?: string;
}

export class RaceRoom extends Room<WireState> {
  tickRate = Number(process.env.TICK_RATE ?? DEFAULT_TICK_RATE);

  onCreate(options: { seed?: number }) {
    const seed = Number(options.seed ?? Date.now());
    this.setState({
      phase: "lobby",
      maze: generateMaze(seed),
      players: {},
      tick: 0,
      result: { winner: null, reason: null },
    });

    this.onMessage("setCreature", (client, creature: Creature) => {
      const taken = new Set(Object.values(this.state.players).map((p) => p.creature));
      if (taken.has(creature)) {
        this.state.error = `Creature ${creature} already taken`;
        return;
      }
      const player = this.state.players[client.sessionId];
      if (!player) return;
      player.creature = creature;
    });

    this.onMessage("submitProgram", (client, source: string) => {
      const player = this.state.players[client.sessionId];
      if (!player) return;
      try {
        player.program = parseProgram(source);
        player.submitted = true;
        this.state.error = undefined;
        if (Object.values(this.state.players).length === 2 && Object.values(this.state.players).every((p) => p.submitted)) {
          this.startMatch();
        }
      } catch (error) {
        this.state.error = (error as Error).message;
      }
    });
  }

  onJoin(client: { sessionId: string }) {
    if (Object.keys(this.state.players).length >= 2) {
      throw new Error("Room already full");
    }
    const isFirst = Object.keys(this.state.players).length === 0;
    this.state.players[client.sessionId] = {
      id: client.sessionId,
      creature: isFirst ? "rabbit" : "frog",
      position: isFirst ? this.state.maze.rabbitSpawn : this.state.maze.frogSpawn,
      direction: "EAST",
      program: [],
      pc: 0,
      submitted: false,
    };
  }

  onLeave(client: { sessionId: string }) {
    delete this.state.players[client.sessionId];
    this.state.phase = "lobby";
  }

  private startMatch() {
    this.state.phase = "running";
    this.state.tick = 0;
    this.clock.setInterval(() => this.step(), 1000 / this.tickRate);
  }

  private step() {
    if (this.state.phase !== "running") return;
    const players = Object.values(this.state.players);
    if (players.length !== 2) return;
    const [rabbit, frog] = players[0].creature === "rabbit" ? players : [players[1], players[0]];

    const rabbitOp = nextOpcode(rabbit, this.state.maze.cells);
    const frogOp = nextOpcode(frog, this.state.maze.cells);

    if (!rabbitOp && !frogOp) {
      this.finish({ winner: "draw", reason: "program-end" });
      return;
    }

    if (rabbitOp) rabbit.pc += 1;
    if (frogOp) frog.pc += 1;

    const rabbitAction = rabbitOp
      ? planAction(this.state.maze, rabbit, rabbitOp, [frog.position])
      : { type: "wait", op: "WAIT" as const };
    const frogAction = frogOp ? planAction(this.state.maze, frog, frogOp, [rabbit.position]) : { type: "wait", op: "WAIT" as const };

    const { nextRabbit, nextFrog, rabbitGoal, frogGoal } = resolveActions(this.state.maze, rabbit, rabbitAction, frog, frogAction);

    this.state.players[rabbit.id] = nextRabbit;
    this.state.players[frog.id] = nextFrog;
    this.state.tick += 1;

    if (rabbitGoal && frogGoal) this.finish({ winner: "draw", reason: "goal" });
    else if (rabbitGoal) this.finish({ winner: "rabbit", reason: "goal" });
    else if (frogGoal) this.finish({ winner: "frog", reason: "goal" });
  }

  private finish(result: MatchResult) {
    this.state.phase = "finished";
    this.state.result = result;
    this.clock.clear();
  }
}
