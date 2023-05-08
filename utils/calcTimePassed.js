//- ====
//- This func calculates the times passed since provided date, and returns nice readable string
module.exports = function (keyword, dateOBJ) {
  const currentDate = new Date();

  let yearsDiff = currentDate.getUTCFullYear() - dateOBJ.getUTCFullYear();
  let monthsDiff = currentDate.getUTCMonth() - dateOBJ.getUTCMonth();
  let daysDiff = currentDate.getUTCDate() - dateOBJ.getUTCDate();
  let hoursDiff = currentDate.getHours() - dateOBJ.getHours();
  const minutesDiff = Math.abs(currentDate.getMinutes() - dateOBJ.getMinutes());
  const hour = `${dateOBJ.getHours()}:${dateOBJ.getMinutes()}`;

  if (daysDiff < 0) {
    yearsDiff--;
    monthsDiff--;
  }

  if (currentDate.getMinutes() < dateOBJ.getMinutes()) {
    hoursDiff--;
  }

  if (currentDate.getUTCMonth() === 0 && dateOBJ.getUTCMonth() !== 0) {
    monthsDiff = 12 - dateOBJ.getUTCMonth();
  }

  // years ago
  if (yearsDiff >= 1) {
    return {
      string: `${keyword} ${
        yearsDiff === 1 ? "year" : `${yearsDiff} years`
      } ago`,
      hour,
    };
  }
  if (yearsDiff === 0) {
    // months ago
    if (Math.abs(monthsDiff) >= 1) {
      // console.log("\n-----------");
      // console.log(
      //   `Months diff: ${monthsDiff}\ncurrentMOnth: ${currentDate.getUTCMonth()}\nDateobjMonth: ${dateOBJ.getUTCMonth()}`
      // );
      return {
        string: `${keyword} ${
          Math.abs(monthsDiff) === 1
            ? "a month"
            : `${Math.abs(monthsDiff)} months`
        } ago`,
        hour,
      };
    }
    if (monthsDiff === 0) {
      daysDiff = Math.round(
        (currentDate - Date.parse(dateOBJ)) / 1000 / 60 / 60 / 24
      );

      // days ago
      if (daysDiff >= 1) {
        return {
          string: `${keyword} ${
            daysDiff === 1 ? `yesterday` : `${daysDiff} days ago`
          }`,
          hour,
        };
      }
      if (daysDiff === 0) {
        // hours ago
        if (hoursDiff >= 1) {
          return {
            string: `${keyword} ${
              hoursDiff === 1 ? "hour ago" : `${hoursDiff} hours ago`
            }`,
            hour,
          };
        }
        if (hoursDiff === 0) {
          // minutes ago
          if (minutesDiff >= 1) {
            return {
              string: `${keyword} ${
                minutesDiff === 1 ? "minute ago" : `${minutesDiff} minutes ago`
              }`,
              hour,
            };
          }
          if (minutesDiff === 0) {
            // seconds ago
            return { string: `${keyword} less than minute ago` };
          }
        }
      }
    }
  }
};
