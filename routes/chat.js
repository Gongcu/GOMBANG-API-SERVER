const express = require('express');
const router = express.Router();
const Chat = require('../models/chat')
const Chatroom_user = require('../models/chatroom_user')
const Chat_unread_user = require('../models/chat_unread_user')
const Chatroom_con_user = require('../models/chatroom_con_user')
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
//특정 동아리의 채팅 가져오기 --> 결국 다 club 라우터 밑으로 옮겨야 됨에 유의
//그리고 특정 동아리의 채팅을 가져올 때 본인이 속한 채팅만 가져와야됨
//채팅 club_id에 속하게 설정해야됨!!!!!!!!!!!!!
//chatroom 라우터 확인!!!!!


//특정 채팅방의 채팅 목록 가져오기 - 역순으로 가져오는게 나을수도
router.get('/:chatroomId',async(req,res,next)=>{
    try{
        const chat = await Chat.sequelize.query(
            `SELECT c.id, c.message, c.createdAt, c.uid, u.token, u.name, u.image,COALESCE(cur.count,0) as count `+
            `FROM chats c left join (select chatId,count(id) as count from chat_unread_user  where chatroomId=${req.params.chatroomId} group by chatId) cur on c.id=cur.chatId join users u on c.uid=u.id `+
            `WHERE c.chatroomId=${req.params.chatroomId} order by c.id`);
        res.send(chat[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅 보내기@
router.post('/', async (req, res, next) => {
    let transaction;
    try {
        transaction = await Chat.sequelize.transaction();
        const chat = await Chat.create({
            chatroomId: req.body.chatroomId,
            uid: req.body.uid,
            message: req.body.message,
        });
        const user = await Chatroom_user.sequelize.query(
            `select c.uid from chatroom_users c left outer join chatroom_con_user ccu on c.uid = ccu.uid `+
            `where ccu.id is null and c.chatroomId=${req.body.chatroomId}`
        )
        for (var i = 0; i < user[0].length; i++)
            await Chat_unread_user.create({ uid: user[0][i].uid, chatId: chat.id, chatroomId: req.body.chatroomId })
        await transaction.commit();
        req.app.get('io').sockets.in(req.body.chatroomId).emit('new message', chat.id);
    } catch (err) {
        await transaction.rollback();
        console.error(err);
        next(err);
    }
});


/*
router.post('/:chatroom_id',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        var file=new Array(), image=new Array(), video=new Array();

        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                file.push(req.files['file'][i].filename);
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                image.push(req.files['image'][i].filename);
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                video.push(req.files['video'][i].filename);
        }
        
        const chatroom = await ChatRoom.findOne({_id:req.params.chatroom_id});
        const chat = await Chat.create({
            chatroom_id: req.params.chatroom_id,
            uid: req.body.uid,
            message:req.body.message,
            image: image,
            file: file,
            video: video,
            contact: req.body.contact,
            unread_uid_list: chatroom.participation_uid_list,
        });
        req.app.io.sockets.in(req.body.chatroom_id).emit('new message', chat);

        if(chat.length===0){
            res.send('chat create failed')
        }else{
            res.send(chat);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});*/

//POSTMAN: 채팅 읽음처리(실시간 참여 시 사용) - chat_unread_user 삭제
router.delete('/read/:chatId/:uid', async (req, res, next) => {
    try {
        await Chat_unread_user.destroy({
            where: {chatId:req.params.chatId, uid:req.params.uid}
        }).then(async(result)=>{
            //채팅 보고 있는 유저들 count 수 갱신해야됨!! socket/ 서버에서는 입장했다는 이벤트를 유저에게 전송 유저는 이벤트 리스터 생성
            const msg = await Chat.sequelize.query(`SELECT c.id, c.message, c.createdAt, c.uid, u.token, u.name, u.image,COALESCE(cur.count,0) as count ` +
            `FROM chats c left join (select chatId,count(id) as count from chat_unread_user group by chatId) cur on c.id=cur.chatId join users u on c.uid=u.id ` +
            `WHERE c.id=${req.params.chatId}`)
            res.send(msg[0][0]);
        }).catch((err)=>{
            res.send(err);
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

module.exports = router;