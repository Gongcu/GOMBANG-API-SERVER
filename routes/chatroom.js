const express = require('express');
const router = express.Router();
const Chat = require('../schemas/chat')
const ChatRoom = require('../schemas/chatroom')
const formatDeleteResult = require('../etc/formatDeleteResult.js');

//해당 동아리의 모든 채팅방 리스트 추출
router.get('/:club_id',async(req,res,next)=>{
    try{
        const chatRoom = await ChatRoom.find({club_id:req.params.club_id}).populate('participation_uid_list', 'name image');
        res.send(chatRoom);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//채팅방 입장할 경우. 읽음표시, 채팅반환
router.get('/enter/:chatroom_id',async(req,res,next)=>{
    try{
        var result = await Chat.updateMany({chatroom_id:req.params.chatroom_id},{$pull:{unread_uid_list:uid}});
        res.send(result);
    }catch(err){
        console.error(err);
        next(err);
    }
});


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
});

//POSTMAN
router.post('/',async(req,res,next)=>{
    try{
        var result = await ChatRoom.create({
            name:req.body.name,
            club_id:req.body.club_id,
            participation_uid_list:req.body.participation_uid_list
        })
        res.send(result);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.post('/invite/:chatroom_id',async(req,res,next)=>{
    try{
        var result = await ChatRoom.updateOne({_id:req.params.chatroom_id},{$push:{participation_uid_list:{$each:req.body.invite_uid_list}}});
        res.send(result);
    }catch(err){
        console.error(err);
        next(err);
    }
});




//POSTMAN
router.delete('/exit/:chatroom_id/:id',async(req,res,next)=>{
    try{
        const chatRoom = await ChatRoom.updateOne({_id:req.params.chatroom_id},{$pull:{participation_uid_list:req.body.uid}});
        res.send(formatDeleteResult(chatRoom));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;