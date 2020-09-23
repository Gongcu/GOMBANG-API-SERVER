const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const connect = require('./schemas');
const user = require('./routes/user');
const club = require('./routes/club');
const image = require('./routes/image')
const event = require('./routes/event')
const auth = require('./routes/auth')
const calendar = require('./routes/calendar')
const qna = require('./routes/qna')
const post = require('./routes/post')

connect();

app.use(express.json({limit:'40mb'}));
app.use('/user', user);
app.use('/club', club);
app.use('/image', image);
app.use('/event', event);
app.use('/auth', auth);
app.use('/calendar', calendar);
app.use('/qna', qna);
app.use('/post', post);

app.listen(3000, () => { //3000번 포트
    console.log("the server is running")
});