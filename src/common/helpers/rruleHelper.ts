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
  expiredAt: Date,
): number => {
  try {
    const startOfMonth = moment().startOf('month').toDate();
    const endOfMonth = moment().endOf('month').toDate();
    const expiredAtDate = moment(expiredAt).toDate();

    if (startOfMonth > expiredAtDate) {
      return 0;
    }
    // Parse the RRULE
    const rule = RRule.fromString(rruleString);
    const lastDate = expiredAtDate < endOfMonth ? expiredAtDate : endOfMonth;

    // Get all occurrences in this range
    const occurrences = rule.between(startOfMonth, lastDate, true);

    return occurrences.length;
  } catch (error) {
    return 0;
  }
};
