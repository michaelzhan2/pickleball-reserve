export {
  // idx-date maps
  numToDay,
  numToMonth,
  monthToNum,

  // date and time options
  timeOptions,
  dateOptions,

  // conversion for id to description
  idToDescription,
};

// Maps between days and months and indices
const numToDay: { [key: number]: string } = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

const numToMonth: { [key: number]: string } = {
  0: "January",
  1: "Febuary",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

const monthToNum: { [key: string]: number } = {
  January: 0,
  Febuary: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

// Date and time options
const dateOptions: {
  date: number;
  month: number;
  year: number;
  description: string;
}[] = _generateDateOptions();
const timeOptions: string[] = _generateTimeOptions();

/**
 * Generate date options for 7 days starting from 3 days from now
 * @returns an array of date options
 */
function _generateDateOptions(): {
  date: number;
  month: number;
  year: number;
  description: string;
}[] {
  const dates: {
    date: number;
    month: number;
    year: number;
    description: string;
  }[] = [];
  const curDate: Date = new Date();
  curDate.setDate(curDate.getDate() + 3);

  let day: string;
  let month: string;
  let dateNumber: number;
  let year: number;
  for (let i = 0; i < 7; i++) {
    day = numToDay[curDate.getDay()];
    month = numToMonth[curDate.getMonth()];
    dateNumber = curDate.getDate();
    year = curDate.getFullYear();
    dates.push({
      date: dateNumber,
      month: curDate.getMonth(),
      year: year,
      description: `${day}, ${month} ${dateNumber}, ${year}`,
    });
    curDate.setDate(curDate.getDate() + 1);
  }
  return dates;
}

/**
 * Generate time options, every half hour from 8:00 AM to 10:00 PM
 * @returns an array of time options
 */
function _generateTimeOptions(): string[] {
  const times = [];
  let time = 8;
  let hourString: string;
  while (time <= 22) {
    hourString = `${((time - 1) % 12) + 1 < 10 ? "0" : ""}${
      ((time - 1) % 12) + 1
    }`;
    times.push(`${hourString}:00 ${time < 12 ? "AM" : "PM"}`);
    if (time !== 22) times.push(`${hourString}:30 ${time < 12 ? "AM" : "PM"}`);
    time++;
  }
  return times;
}

/**
 * Convert a schedule id to a human readable description
 * @param id a schedule id
 * @returns a human readable description of the schedule
 */
function idToDescription(id: string): string {
  const [username, date, month, year, startTime, endTime] = id.split("-");
  const dateObj = new Date(parseInt(year), parseInt(month), parseInt(date));
  const startTimeString: string = timeOptions[parseInt(startTime)];
  const endTimeString: string = timeOptions[parseInt(endTime)];
  const day: string = numToDay[dateObj.getDay()];
  const monthString: string = numToMonth[dateObj.getMonth()];
  const dateNumber: number = dateObj.getDate();
  const yearNumber: number = dateObj.getFullYear();

  return `${username}: ${day}, ${monthString} ${dateNumber}, ${yearNumber} from ${startTimeString} to ${endTimeString}`;
}
