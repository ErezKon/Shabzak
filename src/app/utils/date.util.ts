export const addDays = (date: Date, days: number): Date => {
    date.setDate(date.getDate() + days);
    return date;
}

export const getDates = (startDate: Date, stopDate: Date):Array<Date> => {
    var dateArray = new Array<Date>();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push(new Date (currentDate));
        currentDate = addDays(currentDate, 1);
    }
    return dateArray;
}