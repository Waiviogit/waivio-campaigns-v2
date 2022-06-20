export const stringToArray = (
  value: string | unknown,
): string[] | undefined => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',');
  return;
};

export const numberStingToArray = (
  value: string | unknown,
): number[] | undefined => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',').map((v) => Number(v));
  return;
};
