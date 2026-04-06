const express = require('express');
const {authRouter} = require('./src/routes/auth.routes.cjs');
const {timeTableRouter} = require('./src/routes/timeTable.routes.cjs');
const {taskRouter} = require('./src/routes/task.routes.cjs');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use('/users/auth/v1', authRouter);
app.use('/timetables/v1', timeTableRouter);
app.use('/tasks/v1', taskRouter);

module.exports = {
    app
};