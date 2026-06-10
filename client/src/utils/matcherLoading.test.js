import test from "node:test";
import assert from "node:assert/strict";

import { getMatcherLoadingMessage } from "./matcherLoading.js";

test("getMatcherLoadingMessage starts with shortlist framing", () => {
  assert.equal(getMatcherLoadingMessage(0), "Building shortlist...");
});

test("getMatcherLoadingMessage advances to deeper progress states over time", () => {
  assert.equal(getMatcherLoadingMessage(3500), "Reviewing university fit...");
  assert.equal(getMatcherLoadingMessage(7500), "Scoring programs and tradeoffs...");
});
