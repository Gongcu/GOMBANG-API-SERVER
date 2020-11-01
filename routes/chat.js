const express = require('express');
const router = express.Router();
const Chat = require('../models/chat')
const Chatroom_user = require('../models/chatroom_user')
const Chat_unread_user = require('../models/chat_unread_user')
const multer = require('multer');
const path = require('path');
const uploader = multer({
    storage: multer.diskStorage({
        destination(req,file,cb){
            cb(null, 'upload/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname,ext)+Date.now()+ext);
        }
    }),
    limits: {fileSize: 5*1024*1024},
});




/*
//POSTMAN: 채팅보내기-이미지,파일,동영상 포함 (테스트 필요)
router.post('/',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Post.sequelize.transaction();
        const chat = await Chat.create({
            chatroomId: req.body.chatroomId,
            userId: req.body.userId,
            message: req.body.message,
        });
        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({chatId:chat.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({chatId:chat.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({chatId:chat.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
        }
        //실시간 채팅에 참여하지 않은 유저만 추출
        const user = await Chatroom_user.sequelize.query(
            `select c.userId from chatroom_users c left outer join chatroom_con_users ccu on c.userId = ccu.userId `+
            `where ccu.id is null and c.chatroomId=${req.body.chatroomId}`
        )
        //해당 유저들 읽지 않음 처리.
        for (var i = 0; i < user[0].length; i++)
            await Chat_unread_user.create({ userId: user[0][i].userId, chatId: chat.id, chatroomId: req.body.chatroomId })
        await transaction.commit();

        //해당 채팅방에 new message 소켓 이벤트 발생
        req.app.get('io').sockets.in(req.body.chatroomId).emit('new message', chat.id);

    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});
*/

module.exports = router;