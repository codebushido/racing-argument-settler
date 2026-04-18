import type { Room } from "colyseus.js";
import Phaser from "phaser";
import type { ClientWireState } from "../network/colyseusClient";

export const bindRoomToScene = (room: Room<ClientWireState>, scene: Phaser.Scene) => {
  room.onStateChange((state) => {
    scene.events.emit("state:update", state);
  });
};
