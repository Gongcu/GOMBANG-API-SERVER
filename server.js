const express = require("express");
const app = express();
const mysql = require("mysql");
const dbConfig = require('./config/database.js');
const connection = mysql.createConnection(dbConfig);
const location = require('./routes/location');

app.use('/location', location);
    

app.listen(3000, () => {
    console.log("the server is running")
});