import { randomInt } from 'crypto';

export const selectRandomWinner = (participants: string[]): string => {
  if (participants.length === 0) return '';
  const randomIndex = randomInt(0, participants.length);
  return participants[randomIndex];
};
