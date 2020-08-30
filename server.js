const express = require("express");
const app = express();
const connect = require('./schemas');
const location = require('./routes/location');
const post = require('./routes/post');
const user = require('./routes/user');
const club = require('./routes/club');

connect();

app.use('/location', location);
app.use('/post', post);
app.use('/user', user);
app.use('/club', club);


app.listen(3000, () => { //3000번 포트
    console.log("the server is running")
});