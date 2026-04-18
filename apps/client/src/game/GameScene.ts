import Phaser from "phaser";
import type { ClientWireState } from "../network/colyseusClient";

const TILE = 24;

export class GameScene extends Phaser.Scene {
  private state?: ClientWireState;
  private rabbit?: Phaser.GameObjects.Rectangle;
  private frog?: Phaser.GameObjects.Rectangle;

  constructor() {
    super("race-scene");
  }

  create() {
    this.events.on("state:update", (state: ClientWireState) => {
      this.state = state;
      this.renderState();
    });
  }

  private renderState() {
    if (!this.state) return;
    this.children.removeAll();

    for (let y = 0; y < this.state.maze.size; y++) {
      for (let x = 0; x < this.state.maze.size; x++) {
        const cell = this.state.maze.cells[y][x];
        const color = cell === "wall" ? 0x333333 : cell === "obstacle" ? 0x664422 : cell === "goal" ? 0x22aa22 : 0xdddddd;
        this.add.rectangle(x * TILE + TILE / 2, y * TILE + TILE / 2, TILE - 1, TILE - 1, color);
      }
    }

    const players = Object.values(this.state.players);
    const rabbit = players.find((p) => p.creature === "rabbit");
    const frog = players.find((p) => p.creature === "frog");

    if (rabbit) {
      this.rabbit = this.add.rectangle(rabbit.position.x * TILE + TILE / 2, rabbit.position.y * TILE + TILE / 2, TILE - 6, TILE - 6, 0xff9999);
    }
    if (frog) {
      this.frog = this.add.rectangle(frog.position.x * TILE + TILE / 2, frog.position.y * TILE + TILE / 2, TILE - 6, TILE - 6, 0x99ff99);
    }
  }
}
