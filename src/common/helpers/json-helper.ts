export const parseJSON = (data: string, errorData = {}): any => {
  try {
    return JSON.parse(data);
  } catch (error) {
    return errorData;
  }
};
