import { Equatable, tupleEqualer } from "@esfx/equatable";
import { assert } from "@std/assert/assert";
import { assertEquals } from "@std/assert/equals";
import { assertNotStrictEquals } from "@std/assert/not-strict-equals";
import { assertStrictEquals } from "@std/assert/strict-equals";

import { StringRange } from "../context/StringRange.ts";
import { Suggestion } from "./Suggestion.ts";
import { SuggestionsBuilder } from "./SuggestionsBuilder.ts";

const newBuilder = () => new SuggestionsBuilder("Hello w", 6);

Deno.test("suggest appends", () => {
  const result = newBuilder().suggest("world!").build();
  assert(tupleEqualer.equals([
    new Suggestion(StringRange.between(6, 7), "world!"),
  ], result.list));
  assert(StringRange.between(6, 7)[Equatable.equals](result.range));
  assertStrictEquals(result.isEmpty(), false);
});

Deno.test("suggest replaces", () => {
  const result = newBuilder().suggest("everybody").build();
  assert(tupleEqualer.equals([
    new Suggestion(StringRange.between(6, 7), "everybody"),
  ], result.list));
  assert(StringRange.between(6, 7)[Equatable.equals](result.range));
  assertStrictEquals(result.isEmpty(), false);
});

Deno.test("suggest noop", () => {
  const result = newBuilder().suggest("w").build();
  assert(tupleEqualer.equals([], result.list));
  assertStrictEquals(result.isEmpty(), true);
});

Deno.test("suggest multiple", () => {
  const result = newBuilder()
    .suggest("world!")
    .suggest("everybody")
    .suggest("weekend")
    .build();
  assert(tupleEqualer.equals([
    new Suggestion(StringRange.between(6, 7), "everybody"),
    new Suggestion(StringRange.between(6, 7), "weekend"),
    new Suggestion(StringRange.between(6, 7), "world!"),
  ], result.list));
  assert(StringRange.between(6, 7)[Equatable.equals](result.range));
  assertStrictEquals(result.isEmpty(), false);
});

Deno.test("restart", () => {
  const builder = newBuilder();
  builder.suggest("won't be included in restart");
  const other = builder.restart();
  assertNotStrictEquals(other, builder);
  assertStrictEquals(other.input, builder.input);
  assertStrictEquals(other.start, builder.start);
  assertStrictEquals(other.remaining, builder.remaining);
});

Deno.test("sort alphabetical", () => {
  const result = newBuilder()
    .suggest("2")
    .suggest("4")
    .suggest("6")
    .suggest("8")
    .suggest("30")
    .suggest("32")
    .build();
  assertEquals(result.list.map((s) => s.text), [
    "2",
    "30",
    "32",
    "4",
    "6",
    "8",
  ]);
});

Deno.test("sort numerical", () => {
  const result = newBuilder()
    .suggest(2)
    .suggest(4)
    .suggest(6)
    .suggest(8)
    .suggest(30)
    .suggest(32)
    .build();
  assertEquals(result.list.map((s) => s.text), [
    "2",
    "4",
    "6",
    "8",
    "30",
    "32",
  ]);
});

Deno.test("sort mixed", () => {
  const result = newBuilder()
    .suggest("11")
    .suggest("22")
    .suggest("33")
    .suggest("a")
    .suggest("b")
    .suggest("c")
    .suggest(2)
    .suggest(4)
    .suggest(6)
    .suggest(8)
    .suggest(30)
    .suggest(32)
    .suggest("3a")
    .suggest("a3")
    .build();
  assertEquals(result.list.map((s) => s.text), [
    "2",
    "4",
    "6",
    "8",
    "30",
    "32",
    "11",
    "22",
    "33",
    "3a",
    "a",
    "a3",
    "b",
    "c",
  ]);
});
