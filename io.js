module.exports = function(server){
    var socket = require('socket.io')
    var io = socket.listen(server)
    io.on('connection', (socket) => {
      
        socket.on('join', (data) => {//data: 클라이언트에서 전달받은 방번호
          console.log(data);
          socket.join(data);//room 입장
          io.sockets.in(data).emit('new user', data);
        })
    
        socket.on('new message', (data) => {
            var item = {
                uid:data.uid,
                message:data.message,
                createdAt:data.createdAt
            }
            io.sockets.in(data.room).emit('new message', item);
            console.log(data);
        });
    
      });
    return io;
}