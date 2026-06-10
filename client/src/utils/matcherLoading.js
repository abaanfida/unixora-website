export const getMatcherLoadingMessage = (elapsedMs) => {
  if (elapsedMs >= 7000) return "Scoring programs and tradeoffs...";
  if (elapsedMs >= 3000) return "Reviewing university fit...";
  return "Building shortlist...";
};
