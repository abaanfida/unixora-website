import test from "node:test";
import assert from "node:assert/strict";

import {
  getVoiceRecorderSupport,
  pickSupportedAudioMimeType,
  shouldStopForSilence,
} from "./voiceRecorder.js";

test("pickSupportedAudioMimeType returns the first supported mime type", () => {
  const MediaRecorderMock = {
    isTypeSupported: (mimeType) => mimeType === "audio/webm;codecs=opus",
  };

  assert.equal(pickSupportedAudioMimeType(MediaRecorderMock), "audio/webm;codecs=opus");
});

test("pickSupportedAudioMimeType falls back to empty string when no explicit type is supported", () => {
  const MediaRecorderMock = {
    isTypeSupported: () => false,
  };

  assert.equal(pickSupportedAudioMimeType(MediaRecorderMock), "");
});

test("getVoiceRecorderSupport requires getUserMedia and MediaRecorder", () => {
  const support = getVoiceRecorderSupport(
    {
      MediaRecorder: { isTypeSupported: () => true },
    },
    {
      mediaDevices: {
        getUserMedia: async () => {},
      },
    },
  );

  assert.equal(support.isSupported, true);
  assert.equal(support.mimeType, "audio/webm;codecs=opus");
});

test("getVoiceRecorderSupport reports unsupported when browser capture APIs are missing", () => {
  const support = getVoiceRecorderSupport({}, {});

  assert.equal(support.isSupported, false);
  assert.equal(support.mimeType, "");
});

test("shouldStopForSilence returns true after silence exceeds the allowed gap", () => {
  assert.equal(shouldStopForSilence({ speechDetected: true, silentForMs: 1400, silenceLimitMs: 1200 }), true);
});

test("shouldStopForSilence ignores silence before speech begins", () => {
  assert.equal(shouldStopForSilence({ speechDetected: false, silentForMs: 5000, silenceLimitMs: 1200 }), false);
});
