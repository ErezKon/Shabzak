import { formatNumber } from "./number.utils";

export const addDays = (date: Date, days: number): Date => {
    date.setDate(date.getDate() + days);
    return date;
}

export const getDates = (startDate: Date, stopDate: Date):Array<Date> => {
    var dateArray = new Array<Date>();
    var currentDate = new Date(startDate);
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = addDays(currentDate, 1);
    }
    return dateArray;
}

export const toServerString = (date: Date):string => {
    const year = formatNumber(date.getFullYear(), 4);
    const month = formatNumber(date.getMonth() + 1, 2);
    const day = formatNumber(date.getDate(), 2);
    const hour = formatNumber(date.getHours(), 2);
    const minute = formatNumber(date.getMinutes(), 2);
    const seconds = formatNumber(date.getSeconds(), 2);
    const ms = formatNumber(date.getMilliseconds(), 3);
    return `${year}-${month}-${day}T${hour}:${minute}:${seconds}.${ms}Z`;
}

export const mergeDateTime = (date: Date | null, time: string): Date | null  => {
    const timeRegex = new RegExp('[0-9]{2}:[0-9]{2}');
    if(!date || !timeRegex.test(time)) {
      return null;
    }
    const timeSpl = time.split(':');
    date.setHours(+timeSpl[0]);
    date.setMinutes(+timeSpl[1]);
    return date;
  }