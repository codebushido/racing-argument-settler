import { describe, expect, it } from "vitest";
import { parseProgram } from "../game/parser";

describe("parseProgram", () => {
  it("parses simple commands", () => {
    const program = parseProgram("MOVE\nLEFT\nRIGHT");
    expect(program).toHaveLength(3);
  });

  it("parses if statement", () => {
    const program = parseProgram("IF AHEAD_IS_WALL THEN RIGHT");
    expect(program[0]).toMatchObject({ kind: "if", condition: "AHEAD_IS_WALL" });
  });

  it("rejects unknown commands", () => {
    expect(() => parseProgram("JUMP")).toThrow(/unknown command/);
  });
});
