const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const connect = require('./schemas');
const location = require('./routes/location');
const post = require('./routes/post');
const user = require('./routes/user');
const club = require('./routes/club');
const image = require('./routes/image')
const event = require('./routes/event')
const auth = require('./routes/auth')
const calendar = require('./routes/calendar')
const qna = require('./routes/qna')


connect();

app.use(express.json({limit:'25mb'}));
app.use('/location', location);
app.use('/post', post);
app.use('/user', user);
app.use('/club', club);
app.use('/image', image);
app.use('/event', event);
app.use('/auth', auth);
app.use('/calendar', calendar);
app.use('/qna', qna);

app.listen(3000, () => { //3000번 포트
    console.log("the server is running")
});