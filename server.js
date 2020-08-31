const express = require("express");
const app = express();
const connect = require('./schemas');
const location = require('./routes/location');
const post = require('./routes/post');
const user = require('./routes/user');
const club = require('./routes/club');
const image = require('./routes/image')

connect();

app.use(express.json({limit:'25mb'}));
app.use('/location', location);
app.use('/post', post);
app.use('/user', user);
app.use('/club', club);
app.use('/image', image);

app.listen(3000, () => { //3000번 포트
    console.log("the server is running")
});