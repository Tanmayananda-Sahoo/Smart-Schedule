const {Task} = require('../models/task.models.cjs');

const calculatePriority = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);

    // const dayDiff = (deadlineDate - today)/(1000*60*60*24);

    if(deadline <= 1) return "High"
    else if(deadline <= 3) return "Medium"

    return "Low";
}

const fetchTask = async(id) => {
    const tasks = await Task.find({
        userId: id
    }).sort({deadline: 1})

    await Promise.all(tasks.map(async(task) => {
        const newPriority = calculatePriority(task.deadline);
        if(newPriority != task.priorityStatus) {
            await Task.findByIdAndUpdate(
                task._id,
                {priorityStatus: newPriority},
                {new:true}
            )
        }
    }))
    return tasks;
}
module.exports = {
    calculatePriority,
    fetchTask
}