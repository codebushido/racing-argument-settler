import http from "node:http";
import express from "express";
import { Server } from "colyseus";
import { RaceRoom } from "./rooms/RaceRoom";

const app = express();
app.use(express.json());
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const server = http.createServer(app);
const gameServer = new Server({ server });
gameServer.define("race", RaceRoom);

const port = Number(process.env.PORT ?? 2567);
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Race server listening on ${port}`);
});
