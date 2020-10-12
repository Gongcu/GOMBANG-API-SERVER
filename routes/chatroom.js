const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Chat = require('../models/chat')
const Chatroom_user = require('../models/chatroom_user')
const Chatroom_con_user = require('../models/chatroom_con_user')
const Chatroom = require('../models/chatroom')
const Chat_unread_user = require('../models/chat_unread_user')
const deleteRow = require('../etc/deleteRow.js');

//해당 동아리의 모든 채팅방 리스트 추출
router.get('/:club_id',async(req,res,next)=>{
    try{
        const chatroom = await Chatroom.findAll({
            where:{club_id:req.params.club_id},
        })
        res.send(chatroom);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//채팅방 입장할 경우. 읽음표시, 채팅반환, body-uid,params -chatroomid
router.get('/enter/:chatroomId/:uid',async(req,res,next)=>{
    try{
        await Chatroom_con_user.create({chatroomId:req.params.chatroomId,uid:req.params.uid})
        await Chat_unread_user.destroy({
            where: {chatroomId:req.params.chatroomId, uid:req.params.uid}
        }).then(async(result)=>{
            //채팅 보고 있는 유저들 count 수 갱신해야됨!! socket/ 서버에서는 입장했다는 이벤트를 유저에게 전송 유저는 이벤트 리스터 생성
            const chat = await Chat.sequelize.query(
                `SELECT c.id, c.message, c.createdAt, c.uid, u.token, u.name, u.image,COALESCE(cur.count,0) as count `+
                `FROM chats c left join (select chatId,count(id) as count from chat_unread_user  where chatroomId=${req.params.chatroomId} group by chatId) cur on c.id=cur.chatId join users u on c.uid=u.id `+
                `WHERE c.chatroomId=${req.params.chatroomId} order by c.id asc`);
            req.app.get('io').sockets.in(req.params.chatroomId).emit('join', chat[0]);
            res.send(chat[0]);
        }).catch((err)=>{
            res.send(err);
        })
        
    }catch(err){
        console.error(err);
        next(err);
    }
});
//채팅방 나갈 경우-연결 유저에서 제거
router.delete('/leave/:chatroomId/:uid',async(req,res,next)=>{
    try{
        const result = await Chatroom_con_user.destroy({
            where:{chatroomId:req.params.chatroomId,uid:req.params.uid}
        })
        res.status(200).send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

/*
//새로운 메시지에 대한 점멸등 --> 이거 코딩 잘못됨 각 채팅방 별로 점멸등 킬지 말지 리스트 주는게 좋을듯
router.get('flasher/:club_id/:uid',async(req,res,next)=>{
    try{
        const chat = await Chat.find({club_id:req.params.club_id}).sort({_id:1}).limit(1);
        const unread_uid_list = chat[0].unread_uid_list;
        const exist=unread_uid_list.indexOf(req.params.uid);
        if(exist===-1) //읽지 않는 사람이 아니다. == 읽은사람. 점멸등 필요없음
            res.send(false);
        else
            res.send(true);
    }catch(err){
        console.error(err);
        next(err);
    }
});*/

//POSTMAN: 채팅방 생성@
router.post('/',async(req,res,next)=>{
    try{   
        const chatroom = await Chatroom.create({
            name:req.body.name,
            club_id:req.body.club_id
        });
        const userlist = req.body.user;
        for(var i=0; i<userlist.length; i++){
            await Chatroom_user.create({chatroomId:chatroom.id,uid:userlist[i]});
        }
        res.send(chatroom);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.post('/invite/:chatroom_id',async(req,res,next)=>{
    try{
        var result = await Chatroom_user.create({
            uid:req.body.uid,
            chatroomId:req.params.chatroom_id
        })
        res.send(result);
    }catch(err){
        console.error(err);
        next(err);
    }
});




//POSTMAN: 채팅방 삭제(leave와 다름)
router.delete('/delete/:chatroom_id/:uid',async(req,res,next)=>{
    try{
        const result = await Chatroom_user.destroy({
            where:{chatroomId:req.params.chatroom_id,uid:req.body.uid}
        })
        await Chat_unread_user.destroy({
            where:{chatroomId:req.params.chatroom_id,uid:req.body.uid}
        })
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;