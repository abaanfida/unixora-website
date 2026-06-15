export const canSendMatcherRequest = ({ formData, isLoading, isExplicitGenerate }) => {
  return Boolean(isExplicitGenerate && !isLoading && formData.field_of_study);
};
