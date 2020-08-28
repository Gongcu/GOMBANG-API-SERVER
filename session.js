const express = require("express");
const session = require("express-session")
const sessionConfig = require("./config/mysql_session.js");
const MySQLStore = require("express-mysql-session")(session)

var app = express();


app.use(session({
    secret: 'knmy0101',
    resave: false,
    saveUninitialized: false,
    store: MySQLStore
}));
