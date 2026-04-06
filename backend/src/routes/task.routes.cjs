const express = require('express');
const { isUserAuthenticated } = require('../middlewares/auth.middlewares.cjs');
const { addTask, fetchTodayTask, updateTaskStatus } = require('../controllers/tasks.controllers.cjs');

const taskRouter = express.Router();

taskRouter.post('/add', isUserAuthenticated, addTask);
taskRouter.get('/fetch', isUserAuthenticated, fetchTodayTask);
taskRouter.patch('/update/status/{:id}', isUserAuthenticated, updateTaskStatus);
module.exports = {
    taskRouter
}