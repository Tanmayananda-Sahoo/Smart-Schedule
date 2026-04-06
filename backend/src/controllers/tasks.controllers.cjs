const {Task} = require('../models/task.models.cjs');
// const {convertToMinutes, sortSchedules, detectFreeSlots} = require('../utils/timeTable.cjs');
const {calculatePriority, fetchTask} = require('../utils/task.cjs');

//complete and tested.
const addTask = async (req, res) => {
  try {

    const { title, time, subject, deadline } = req.body;

    // Validation
    if (
      !title?.trim() ||
      !subject?.trim() ||
      !deadline ||
      !time?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    if(deadline<0 || time<=0) {
      return res.status(400)
      .json({
        message: "Deadline or time has to be a positive value."
      })
    }

    // Calculate priority
    const priorityStatus = calculatePriority(deadline);

    const newTask = await Task.create({
      userId: req.user.id,
      title,
      subject,
      time,
      deadline,
      completionStatus: "Pending",
      priorityStatus
    });

    return res.status(201).json({
      message: "Task added successfully.",
      task: newTask
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error adding task",
      error: error.message
    });
  }
};

//completed and tested
const fetchTodayTask = async(req,res) => {
    const id = req.user._id;
    const tasks = await fetchTask(id);
    
    return res.status(200)
    .json({
        message: "All the tasks for today are fetched successfully.",
        tasks
    })
}

//completed and tested
const updateTaskStatus = async(req,res) => {
    const {id} = req.params;
    const {completionStatus} = req.body;

    if(!id) {
        return res.status(400)
        .json({
            message: "Please select a task to update."
        })
    }
    console.log("id:",id);
    const task = await Task.findByIdAndUpdate(
        id,
        {completionStatus},
        {new:true}
    )
    console.log("task:",task);
    if(!task) {
        return res.status(400)
        .json({
            message: "Task could not be updated."
        })
    }

    return res.status(200)
    .json({
        message: "Task updated successfully.",
        task
    })
}

module.exports = {
    addTask,
    fetchTodayTask,
    updateTaskStatus
}