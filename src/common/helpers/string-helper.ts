export const startsWithAtSign = (string: string): boolean => {
  if (!string) return false;
  return string.startsWith('@');
};
