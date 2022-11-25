type Registers = [number, number, number, number];
export type State = {
  pc: number;
  registers: Registers;
  out: number[];
};
type RegName = "a" | "b" | "c" | "d";
const OPS = {
  CPY: 0,
  INC: 1,
  DEC: 2,
  JNZ: 3,
  OUT: 4,
} as const;
type Op = typeof OPS[keyof typeof OPS];
type Instruction = {
  args: [RegName | number, RegName | number] | [RegName | number];
  op: Op;
};

export function compile(i: string): Instruction {
  let tokens = i.split(" ");
  let op;
  switch (tokens[0]) {
    case "cpy":
      op = OPS.CPY;
      break;
    case "inc":
      op = OPS.INC;
      break;
    case "dec":
      op = OPS.DEC;
      break;
    case "jnz":
      op = OPS.JNZ;
      break;
    case "out":
      op = OPS.OUT;
      break;
    default:
      assert(false);
  }
  let args = tokens.slice(1).map((x) => {
    let xAsNum = parseInt(x, 10);
    if (Number.isFinite(xAsNum)) {
      return xAsNum;
    } else {
      assert("abcd".indexOf(x) !== -1);
      return x;
    }
  });
  return { op, args } as Instruction;
}

function assert(expr: boolean, msg = "") {
  if (!expr) {
    throw new Error(`failed assertion: ${msg}`);
  }
}

function resolve(x: RegName | number, registers: Registers): number {
  if (Number.isFinite(x)) {
    return x as number;
  }
  let idx = "abcd".indexOf(x as string);
  assert(idx !== -1);
  return registers[idx];
}

export function process(state: State, instructions: Instruction[]): State {
  let { pc, registers, out } = state;
  let { op, args } = instructions[pc];
  switch (op) {
    case OPS.CPY: {
      assert(args.length === 2);
      let regIdx = "abcd".indexOf(args[1] as string);
      assert(regIdx !== -1);
      registers[regIdx] = resolve(args[0], registers);
      pc += 1;
      break;
    }
    case OPS.INC:
    case OPS.DEC: {
      assert(args.length === 1);
      let amt = op === OPS.INC ? 1 : -1;
      let regIdx = "abcd".indexOf(args[0] as string);
      assert(regIdx !== -1);
      registers[regIdx] += amt;
      pc += 1;
      break;
    }
    case OPS.JNZ: {
      assert(args.length === 2);
      let v = resolve(args[0], registers);
      let offset = 1;
      if (v !== 0) {
        offset = args[1] as number;
        assert(Number.isFinite(offset));
      }
      pc += offset;
      break;
    }
    case OPS.OUT: {
      assert(args.length === 1);
      let v = resolve(args[0], registers);
      out.push(v);
      pc += 1;
      break;
    }
    default: {
      assert(false);
    }
  }
  return { pc, registers, out };
}
