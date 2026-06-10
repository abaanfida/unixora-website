const AUDIO_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
];

export const pickSupportedAudioMimeType = (MediaRecorderConstructor) => {
  if (!MediaRecorderConstructor?.isTypeSupported) return "";

  return AUDIO_MIME_TYPES.find((mimeType) => MediaRecorderConstructor.isTypeSupported(mimeType)) || "";
};

export const getVoiceRecorderSupport = (targetWindow, targetNavigator) => {
  const MediaRecorderConstructor = targetWindow?.MediaRecorder;
  const hasGetUserMedia = Boolean(targetNavigator?.mediaDevices?.getUserMedia);
  const mimeType = pickSupportedAudioMimeType(MediaRecorderConstructor);

  return {
    isSupported: Boolean(MediaRecorderConstructor) && hasGetUserMedia,
    mimeType,
  };
};

export const normalizeRecognitionText = (text) => text.replace(/\s+/g, " ").trim();

export const mergeTranscriptIntoInput = (existingText, transcript) => {
  const normalizedExisting = normalizeRecognitionText(existingText || "");
  const normalizedTranscript = normalizeRecognitionText(transcript || "");

  if (!normalizedExisting) return normalizedTranscript;
  if (!normalizedTranscript) return normalizedExisting;

  return `${normalizedExisting} ${normalizedTranscript}`;
};

export const shouldStopForSilence = ({ speechDetected, silentForMs, silenceLimitMs }) => {
  if (!speechDetected) return false;

  return silentForMs >= silenceLimitMs;
};

export const blobToBase64 = async (blob) => {
  const arrayBuffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return window.btoa(binary);
};
