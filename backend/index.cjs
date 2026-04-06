const {app} = require('./app.cjs');
const express = require('express');
const {connectDB} = require('./src/db/index.db.cjs');


require('dotenv').config({
    path: './.env'
})

    
connectDB()
.then(() => {
    app.listen(process.env.PORT, ()=> {
        console.log(`App is running on port ${process.env.PORT}`);
    })
})
.catch((error) => {
    console.log(`App has some issues in connecting to server: ${error}`);
})
