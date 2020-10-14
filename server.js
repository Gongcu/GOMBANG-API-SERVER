const express = require("express");
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const connect = require('./schemas');

const {sequelize} = require('./models');

const user = require('./routes/user');
const club = require('./routes/club');
const image = require('./routes/image')
const auth = require('./routes/auth')
const calendar = require('./routes/calendar')
const qna = require('./routes/qna')
const post = require('./routes/post')
const portfolio = require('./routes/portfolio')
const chat = require('./routes/chat')
const chatroom = require('./routes/chatroom')
const applicationForm = require('./routes/applicationForm')
const search = require('./routes/search')

 // 소켓 start
const http = require('http');
const server = http.createServer(app);
const io = require('./io')(server)
 // 소켓 end
 
connect();

app.set('io',io);
app.use(express.json({limit:'40mb'}));

//테이블 내용 변경시 force:true
sequelize.sync({force:false}).then(()=>{console.log("DB CONNECTED")}).catch((err)=>{console.log(err)});

app.use('/user', user);
app.use('/club', club);
app.use('/image', image);
app.use('/auth', auth);
app.use('/calendar', calendar);
app.use('/qna', qna);
app.use('/post', post);
app.use('/portfolio', portfolio);
app.use('/chat', chat);
app.use('/chatroom', chatroom);
app.use('/applicationform', applicationForm);
app.use('/search', search);

server.listen(3000, () => { //3000번 포트
    console.log("the server is running")
});
