import * as momentTZ from 'moment-timezone';
import * as moment from 'moment';

export interface TimezoneDateObject {
  date: Date;
  timezone?: string;
}

export function castToUTC(obj: TimezoneDateObject): Date {
  const { date, timezone } = obj;

  if (timezone) {
    return momentTZ
      .tz(moment(date).format('YYYY-MM-DD HH:mm:ss'), timezone)
      .utc()
      .toDate();
  }

  return momentTZ(moment(date).format('YYYY-MM-DD HH:mm:ss')).utc().toDate();
}
