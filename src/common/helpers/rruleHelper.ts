//recurrenceRule
import { RRule } from 'rrule';

export const getNextEventDate = (rrule: string): string => {
  try {
    const rule = RRule.fromString(rrule);
    const nextDate = rule.after(new Date());
    return nextDate ? nextDate.toISOString() : '';
  } catch (error) {
    return '';
  }
};

export const getNextClosestDate = (rrules: string[]): string => {
  const now = new Date();
  let closestDate: Date | null = null;

  for (const rrule of rrules) {
    try {
      const rule = RRule.fromString(rrule);
      const nextDate = rule.after(now);
      if (nextDate && (!closestDate || nextDate < closestDate)) {
        closestDate = nextDate;
      }
    } catch (error) {
      continue;
    }
  }

  return closestDate ? closestDate.toISOString() : '';
};
