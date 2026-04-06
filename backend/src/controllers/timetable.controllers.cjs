const {Timetable} = require("../models/timetable.models.cjs");
const {fetchFreeSlots, getNextDateForDay, formatDay, fetchTodayTimeTable} = require("../utils/timeTable.cjs");
const {fetchTask} = require("../utils/task.cjs");
const {Task} = require('../models/task.models.cjs');
const {convertToMinutes, minutesToTime} = require('../utils/general.cjs');
//complete and tested
const addTimeTableEntry = async (req, res) => {
  const { title, day, startTime, endTime, isRecurring, venue } = req.body;

  if([title, startTime, endTime, venue].some((field) => field.trim() == "")) {
      return res.status(400).json({
        message: "All the fields are required.",
      });
  }

  const userId = req.user._id;
  if (!userId) {
    return res.status("User is unauthorized to add time table.");
  }

  const dateUpcoming = getNextDateForDay(day);

  console.log(dateUpcoming)

  const timeTable = await Timetable.create({
    title,
    startTime,
    endTime,
    venue,
    dayOfWeek: isRecurring ? day : null,
    specificDate: isRecurring ? null : dateUpcoming,
    userId: req.user._id
  });

  if (!timeTable) {
    return res.status(400).json({
      message:
        "There is a problem with creating time table. Please try once again.",
    });
  }

  return res.status(200).json({
    message: "Time table created successfully.",
    TimeTable: timeTable,
  });
};

//complete and tested
const getTimeTable = async (req, res) => {
  try {
    const today = new Date();
    const todayDay = today.getDay();

    let startOfDay = new Date(today.setHours(0, 0, 0, 0));
    let endOfDay = new Date(today.setHours(23, 59, 59, 999));

    startOfDay = startOfDay.toLocaleDateString("en-GB");
    endOfDay = endOfDay.toLocaleDateString("en-GB");

    const timeTable = await Timetable.find({
      userId: req.user._id,
      $or: [
        { isRecurring: true },
        { specificDate: {$gte: today}, isRecurring: false },
      ],
    }).sort({ startTime: 1 });

    return res.status(200).json({
      message: "Default time table fetched successfully.",
      TimeTable: timeTable,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodayTimeTable = async (req, res) => {
    const id = req.user._id;

    const timeTable = await fetchTodayTimeTable(id);
    return res.status(200).json({
      message: "Default time table fetched successfully.",
      TimeTable: timeTable,
    });
};

//complete and tested
const getFreeSlots = async (req, res) => {
  const id = req.user._id;
  const freeSlots = await fetchFreeSlots(id);
  // console.log(freeSlots);
  return res.status(200).json({
    message: "Free time slots fetched successfully.",
    freeSlots,
  });
};


const generateSchedule = async (req, res) => {
  try {
    const id = req.user._id;

    const freeSlots = await fetchFreeSlots(id);
    const tasks = await fetchTask(id);
    const classes = await fetchTodayTimeTable(id);

    const BREAK_DURATION = 10; // minutes
    const priorityRank = { 'High': 3, 'Medium': 2, 'Low': 1 };

    // -----------------------
    // 1️⃣ Filter & Sort Tasks
    // -----------------------
    // Primary sort: priority (High → Low)
    // Secondary sort: deadline (sooner → later)

    const pendingTasks = tasks
      .filter(task => task.completionStatus === "Pending")
      .sort((a, b) => {
        const pDiff = priorityRank[b.priorityStatus] - priorityRank[a.priorityStatus];
        if (pDiff !== 0) return pDiff;
        return a.deadline - b.deadline;
      });

    const schedule = [];

    // -----------------------
    // 2️⃣ Add Classes First
    // -----------------------

    for (const c of classes) {
      schedule.push({
        type: "class",
        title: c.title,
        venue: c.venue,
        startTime: convertToMinutes(c.startTime),
        endTime: convertToMinutes(c.endTime)
      });
    }

    // -----------------------
    // 3️⃣ Schedule Tasks Into Free Slots
    // -----------------------
    // Tasks can be split across multiple slots.
    // We track remaining minutes for each task.

    const taskQueue = pendingTasks.map(task => ({
      _id: task._id,
      title: task.title,
      subject: task.subject,
      priorityStatus: task.priorityStatus,
      remaining: Number(task.time), // minutes left to schedule
    }));

    for (const slot of freeSlots) {
      let cursor = convertToMinutes(slot.start);
      const slotEnd = convertToMinutes(slot.end);

      for (const task of taskQueue) {
        if (task.remaining <= 0) continue;
        if (cursor >= slotEnd) break;

        const available = slotEnd - cursor;
        if (available <= 0) break;

        // Use whatever time is available: full task or partial
        const allocate = Math.min(task.remaining, available);

        schedule.push({
          type: "task",
          taskId: task._id,
          title: task.title,
          subject: task.subject,
          startTime: cursor,
          endTime: cursor + allocate,
          priorityStatus: task.priorityStatus
        });

        cursor += allocate;
        task.remaining -= allocate;

        // Insert a break after the task (only if there is room
        // and there are more tasks to schedule after this one)
        const hasMoreTasks = taskQueue.some(t => t.remaining > 0 && t !== task) ||
                             task.remaining > 0;

        if (hasMoreTasks && cursor + BREAK_DURATION <= slotEnd) {
          schedule.push({
            type: "break",
            title: "Break",
            startTime: cursor,
            endTime: cursor + BREAK_DURATION
          });
          cursor += BREAK_DURATION;
        }
      }
    }

    // -----------------------
    // 4️⃣ Sort by Start Time
    // -----------------------

    schedule.sort((a, b) => a.startTime - b.startTime);

    // -----------------------
    // 5️⃣ Convert Minutes → HH:MM
    // -----------------------

    const finalSchedule = schedule.map(item => ({
      ...item,
      startTime: minutesToTime(item.startTime),
      endTime: minutesToTime(item.endTime)
    }));

    return res.status(200).json({
      message: "Your schedule for today is successfully created.",
      schedule: finalSchedule
    });

  } catch (error) {
    console.error("Schedule generation error:", error);
    return res.status(500).json({
      message: "Error generating schedule.",
      error: error.message
    });
  }
};

module.exports = {
  addTimeTableEntry,
  getTimeTable,
  getFreeSlots,
  generateSchedule,
  getTodayTimeTable
};
