import test from "node:test";
import assert from "node:assert/strict";

import { canSendMatcherRequest } from "./matcherForm.js";

test("canSendMatcherRequest rejects passive form submits before explicit generate click", () => {
  const formData = { field_of_study: "Computer Science" };

  assert.equal(canSendMatcherRequest({ formData, isLoading: false, isExplicitGenerate: false }), false);
});

test("canSendMatcherRequest allows explicit generate click with a field of study", () => {
  const formData = { field_of_study: "Computer Science" };

  assert.equal(canSendMatcherRequest({ formData, isLoading: false, isExplicitGenerate: true }), true);
});
