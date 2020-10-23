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
        if(transaction)
            await transaction.rollback();
        console.error(err);
        next(err);
    }
});

/*
//POSTMAN: 채팅보내기-이미지,파일,동영상 포함 (테스트 필요)
router.post('/',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Post.sequelize.transaction();
        const chat = await Chat.create({
            chatroomId: req.body.chatroomId,
            uid: req.body.uid,
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
            `select c.uid from chatroom_users c left outer join chatroom_con_user ccu on c.uid = ccu.uid `+
            `where ccu.id is null and c.chatroomId=${req.body.chatroomId}`
        )
        //해당 유저들 읽지 않음 처리.
        for (var i = 0; i < user[0].length; i++)
            await Chat_unread_user.create({ uid: user[0][i].uid, chatId: chat.id, chatroomId: req.body.chatroomId })
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
/**
 * 0. 클라이언트 채팅방 입장: 채팅 목록을 반환하고 DB에 해당 유저가 접속중임을 기록
 * 1. 클라이언트: 채팅 전송
 * 2. 서버측: 해당 채팅기반 데이터 생성하고 생성된 chatId와 함께 새로운 메시지가 생성되었다고 클라이언트에 알림
 * 3. 클라이언트: 해당 이벤트를 수신하고, 해당 id에 해당하는 채팅을 읽겠다는 요청을함.
 * 4. 서버측: 해당 채팅을 읽음 처리하고 count가 반영된 채팅을 반환
 * 5. 클라이언트측: 응답으로 해당 채팅을 받고 뷰에 업데이트.
 * 6. 클라이언트 채팅방 퇴장: DB에 해당 유저가 접속이 끝났음을 반영
 */
//POSTMAN: 채팅 읽음처리(실시간 참여 시 사용) - chat_unread_user 삭제(채팅 읽음 처리)
router.delete('/read/:chatId/:uid', async (req, res, next) => {
    try {
        await Chat_unread_user.destroy({
            where: {chatId:req.params.chatId, uid:req.params.uid}
        }).then(async(result)=>{//읽은 뒤 then 변화된 메시지를 보내야 됨
            //채팅 보고 있는 유저들 count 수 갱신해야됨!! socket/ 서버에서는 입장했다는 이벤트를 유저에게 전송 유저는 이벤트 리스너 생성
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