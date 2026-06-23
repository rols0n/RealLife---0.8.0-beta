export default function (keyword, dateOBJ) {
  const validator = (trueText, falseText, diff, time) => {
    const count = Math.floor(diff);
    string = `${keyword} ${count === 1 ? trueText : `${count} ${falseText}`}`;
  };
  const validatePair = (
    firstName,
    conjunction,
    sndName,
    mainValue,
    sndValue
  ) => {
    if (mainValue < 1) {
      validator(
        `${conjunction} ${firstName} ago`,
        `${firstName.replace(" ", "")}s ago`,
        sndValue
      );
    }
    if (mainValue > 1) {
      validator(
        `${conjunction} ${sndName} ago`,
        `${sndName.replace(" ", "")}s ago`,
        mainValue
      );
    }
  };
  const currentDate = new Date();
  const timeDiffInMs = currentDate - dateOBJ;
  const timeDiffInSeconds = timeDiffInMs / 1000;
  const timeDiffInMinutes = timeDiffInSeconds / 60;
  const timeDiffInHours = timeDiffInMinutes / 60;
  const timeDiffInDays = timeDiffInHours / 24;
  const timeDiffInMonths = timeDiffInDays / 30;
  const timeDiffInYears = timeDiffInMonths / 12;
  let string = `${keyword} ${timeDiffInMinutes} ago`;
  let shortString = `${Math.floor(timeDiffInMinutes)}min`;
  let hour =
    dateOBJ.getHours() +
    ":" +
    `${
      dateOBJ.getMinutes() * 1 < 10
        ? "0" + dateOBJ.getMinutes()
        : dateOBJ.getMinutes()
    }`;

  // Seconds/Minutes
  if (timeDiffInMinutes < 60)
    validatePair("second", "a", "minute", timeDiffInMinutes, timeDiffInSeconds);

  // Minutes/Hours
  if (timeDiffInHours < 24 && timeDiffInHours >= 1) {
    validatePair("minute", "an", "hour", timeDiffInHours, timeDiffInMinutes);
    shortString = `${Math.floor(timeDiffInHours)}h`;
  }

  // Hours/Days
  if (timeDiffInDays < 31 && timeDiffInDays >= 1) {
    validatePair("hour", "a", "day", timeDiffInDays, timeDiffInHours);
    shortString = `${Math.floor(timeDiffInDays)}d`;
  }

  // Days/Months
  if (timeDiffInMonths < 12 && timeDiffInMonths >= 1) {
    validatePair("day", "a", "month", timeDiffInMonths, timeDiffInDays);
    shortString = `${Math.floor(timeDiffInMonths)}m`;
  }
  // Months/Years
  if (timeDiffInMonths >= 12) {
    validatePair("month", "a", "year", timeDiffInYears, timeDiffInMonths);
    shortString = `${Math.floor(timeDiffInYears)}y`;
  }

  if (timeDiffInDays >= 7) {
    hour = dateOBJ.toDateString();
  }

  let shouldDisplayOnlyHour = false;

  if (timeDiffInHours < 24) {
    shouldDisplayOnlyHour = true;
  }

  return {
    string,
    hour,
    shouldDisplayOnlyHour,
    shortString,
  };
}
