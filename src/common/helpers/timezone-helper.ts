import * as moment from 'moment-timezone';

export interface TimezoneDateObject {
  date: Date;
  timezone?: string;
}

export function castToUTC(obj: TimezoneDateObject): Date {
  const { date, timezone } = obj;

  if (timezone) {
    // If timezone is provided, parse the date in that timezone and convert to UTC
    return moment.tz(date, timezone).utc().toDate();
  } else {
    // If no timezone, treat as local time and convert to UTC
    return moment(date).utc().toDate();
  }
}
