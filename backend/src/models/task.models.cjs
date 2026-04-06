const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    deadline: {
        type: Number,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completionStatus: {
        type: String,
        enum: ['Completed', 'Pending']
    },
    priorityStatus: {
        type: String,
        enum: ['High', 'Medium', 'Low']
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    scheduled: {
        type: Boolean,
        default: false
    }
})

const Task = new mongoose.model("Task", taskSchema);

module.exports = {
    Task
}