const express = require("express");
const app = express();
const location = require('./routes/location');
const post = require('./routes/post');
const user = require('./routes/user');


app.use('/location', location);
app.use('/post', post);
app.use('/user', user);

app.listen(3000, () => { //3000번 포트
    console.log("the server is running")
});