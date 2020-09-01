const mongoose = require('mongoose');

const connect = () =>{
    if(process.env.NODE_ENV !== 'production'){ //개발환경일 경우에만 콘솔 출력
        mongoose.set('debug',true);
    }
    mongoose.connect('mongodb://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@localhost:27017/admin',{
        dbName:'test',
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    }, (error)=>{
        if(error)
            console.log('mongodb connect error', error);
        else
            console.log('mongodb connect');
    });
};

mongoose.connection.on('error', (error)=>{
    console.log('mongodb connect error', error);
});
mongoose.connection.on('disconnected',()=>{
    console.log('mongodb id disconnected. Tying to connect again');
    connect();
});

module.exports = connect;