export const pickRandom = <T>(arr: T[]): T | undefined => {
  if (arr.length === 0) return undefined;
  const index = Math.floor(Math.random() * arr.length);
  return arr[index];
};
