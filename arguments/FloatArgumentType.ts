import { combineHashes, rawHash } from "@esfx/equatable";

import { CommandSyntaxError } from "../errors/CommandSyntaxError.ts";
import type { StringReader } from "../StringReader.ts";
import { ArgumentType } from "./ArgumentType.ts";

export class FloatArgumentType extends ArgumentType<number> {
  readonly minimum: number;
  readonly maximum: number;

  constructor(minimum = -Number.MAX_VALUE, maximum = Number.MAX_VALUE) {
    super();
    this.minimum = minimum;
    this.maximum = maximum;
  }

  override parse(reader: StringReader): number {
    const start = reader.getCursor();
    const result = reader.readFloat();
    if (result < this.minimum) {
      reader.setCursor(start);
      throw CommandSyntaxError.builtInErrors.floatTooLow
        .createWithContext(reader, result, this.minimum);
    }
    if (result > this.maximum) {
      reader.setCursor(start);
      throw CommandSyntaxError.builtInErrors.floatTooHigh
        .createWithContext(reader, result, this.maximum);
    }
    return result;
  }

  override _equals(other: this): boolean {
    return this.minimum === other.minimum && this.maximum === other.maximum;
  }

  override _hash(): number {
    return combineHashes(rawHash(this.minimum), rawHash(this.maximum));
  }

  override toString(): string {
    if (this.maximum < Number.MAX_VALUE) {
      return `float(${this.minimum}, ${this.maximum})`;
    }
    if (this.minimum > -Number.MAX_VALUE) {
      return `float(${this.minimum})`;
    }
    return "float()";
  }

  override getExamples(): Iterable<string> {
    return ["0", "1.2", ".5", "-1", "-.5", "-1234.56"];
  }
}

export function float(min?: number, max?: number): FloatArgumentType {
  return new FloatArgumentType(min, max);
}
