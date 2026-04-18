export type SimpleOpcode = "MOVE" | "LEFT" | "RIGHT" | "WAIT" | "HOP";
export type Condition = "AHEAD_IS_WALL";

export interface CommandInstruction {
  kind: "command";
  op: SimpleOpcode;
}

export interface IfInstruction {
  kind: "if";
  condition: Condition;
  then: CommandInstruction;
}

export type Instruction = CommandInstruction | IfInstruction;
