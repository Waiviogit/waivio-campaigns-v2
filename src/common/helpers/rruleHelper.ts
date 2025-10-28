//recurrenceRule
import { RRule } from 'rrule';
import * as moment from 'moment/moment';

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

export const countOccurrencesInCurrentMonth = (
  rruleString: string,
  startDate = new Date(),
): number => {
  try {
    // Parse the RRULE
    const rule = RRule.fromString(rruleString);
    rule.options.dtstart = startDate;

    // Get start and end of current month
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();

    // Get all occurrences in this range
    const occurrences = rule.between(startOfMonth, endOfMonth, true);

    return occurrences.length;
  } catch (error) {
    return 0;
  }
};
