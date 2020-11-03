module.exports = function(server){
    var socket = require('socket.io')
    var io = socket.listen(server)
    io.on('connection', (socket) => {
        socket.on('join', async(data) => {//data: 클라이언트에서 전달받은 방번호
          socket.join(data.chatroomId);//room 입장
        })

        socket.on('new message', (data) => {
            var item = {
                userId:data.userId,
                message:data.message,
                createdAt:data.createdAt
            }
            io.sockets.in(data.room).emit('new message', item);
        });
    
      });
    return io;
}