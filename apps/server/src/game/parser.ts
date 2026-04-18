import { MAX_INSTRUCTION_COUNT, MAX_SOURCE_LENGTH } from "@race/shared";
import type { CommandInstruction, Instruction, SimpleOpcode } from "@race/shared";

const SIMPLE_OPS: SimpleOpcode[] = ["MOVE", "LEFT", "RIGHT", "WAIT", "HOP"];

const parseCommand = (token: string, line: number): CommandInstruction => {
  if (!SIMPLE_OPS.includes(token as SimpleOpcode)) {
    throw new Error(`Line ${line}: unknown command '${token}'`);
  }
  return { kind: "command", op: token as SimpleOpcode };
};

export const parseProgram = (source: string): Instruction[] => {
  if (source.length > MAX_SOURCE_LENGTH) {
    throw new Error(`Source too long (max ${MAX_SOURCE_LENGTH} chars)`);
  }

  const instructions: Instruction[] = [];
  const lines = source.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i].trim();
    if (!raw) continue;

    if (raw.startsWith("IF ")) {
      const m = /^IF\s+([A-Z_]+)\s+THEN\s+([A-Z_]+)$/.exec(raw);
      if (!m) throw new Error(`Line ${i + 1}: invalid IF syntax`);
      const [, cond, thenOp] = m;
      if (cond !== "AHEAD_IS_WALL") {
        throw new Error(`Line ${i + 1}: unsupported condition '${cond}'`);
      }
      const thenInstruction = parseCommand(thenOp, i + 1);
      instructions.push({ kind: "if", condition: "AHEAD_IS_WALL", then: thenInstruction });
    } else {
      instructions.push(parseCommand(raw, i + 1));
    }

    if (instructions.length > MAX_INSTRUCTION_COUNT) {
      throw new Error(`Too many instructions (max ${MAX_INSTRUCTION_COUNT})`);
    }
  }

  if (instructions.length === 0) {
    throw new Error("Program is empty");
  }

  return instructions;
};
