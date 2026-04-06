const {Timetable} = require('../models/timetable.models.cjs');

const convertToMinutes = async (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return 60 * hours + minutes;
};

const sortSchedules = async () => {
  schedules.sort(
    (a, b) => convertToMinutes(a.startTime) - convertToMinutes(b.startTime),
  );
};

const formatDay = (dayNumber) => {
  const dayMap = {
    1: "Monday",
    2: "Tuesday",
    3: "Wednesday",
    4: "Thursday",
    5: "Friday",
    6: "Saturday",
    0: "Sunday"
  }

  return dayMap[dayNumber];
}
// function detectFreeSlots(schedules) {
//   const freeSlots = [];

//   let startOfDay = 0;
//   let endOfDay = 1440;

//   let previousEnd = startOfDay;

//   for (let schedule of schedules) {
//     const start = convertToMinutes(schedule.startTime);
//     const end = convertToMinutes(schedule.endTime);

//     if (start > previousEnd) {
//       freeSlots.push({
//         start: previousEnd,
//         end: start,
//       });
//     }

//     previousEnd = end;
//   }

//   if (previousEnd < endOfDay) {
//     freeSlots.push({
//       start: previousEnd,
//       end: endOfDay,
//     });
//   }

//   return freeSlots;
// }

const fetchFreeSlots = async(id) => {
  const today = new Date();
  const todayDay = formatDay(today.getDay());

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const timeTable = await Timetable.find({
    userId: id,
    $or: [
      { dayOfWeek: todayDay, isRecurring: true },
      { specificDate: { $gte: start, $lte: end }, isRecurring: false },
    ],
  }).sort({ startTime: 1 });

  const startOfDay = "08:00";
  const endOfDay = "23:00";

  let freeSlots = [];

  let currentTime = startOfDay;

  timeTable.map((time) => {
    // console.log("Time:", time);
    // console.log("Start Time:", time.startTime);
    // console.log("End Time:", time.endTime);
    // console.log("Current Time before", currentTime);
    // console.log("Current Time before", currentTime);
    if (currentTime < time.startTime) {
      freeSlots.push({
        start: currentTime,
        end: time.startTime,
      });
    }
    // console.log("Free Slots: ",freeSlots);
    currentTime = time.endTime;
    // console.log("Current Time after", currentTime);
  });

  if (currentTime < endOfDay) {
    freeSlots.push({
      start: currentTime,
      end: endOfDay,
    });
  }
  // console.log(freeSlots);
  return freeSlots;
}

function getNextDateForDay(dayName) {

  const days = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };

  const today = new Date();
  const todayDay = today.getDay();

  const targetDay = days[dayName.toLowerCase()];

  let diff = targetDay - todayDay;

  if (diff <= 0) {
    diff += 7;
  }

  const resultDate = new Date();
  resultDate.setDate(today.getDate() + diff);

  return resultDate.toLocaleDateString("en-GB");
}

async function fetchTodayTimeTable(id){
  try {
      let today = new Date();
        const todayDay = today.getDay();
    
        let startOfDay = new Date(today.setHours(0, 0, 0, 0));
        let endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
        const todayDate = today.toLocaleDateString("en-GB");
        startOfDay = startOfDay.toLocaleDateString("en-GB");
        endOfDay = endOfDay.toLocaleDateString("en-GB");
    
        const timeTable = await Timetable.find({
          userId: id,
          $or: [
            { isRecurring: true, dayOfWeek: formatDay(today.getDay())},
            { specificDate: todayDate, isRecurring: false },
          ],
        }).sort({ startTime: 1 });

        return timeTable;
  } catch (error) {
    console.error(error)
  }
}
module.exports = {
  convertToMinutes,
  sortSchedules,
  fetchFreeSlots,
  getNextDateForDay,
  formatDay,
  fetchTodayTimeTable
};
