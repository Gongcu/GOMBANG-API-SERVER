const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Chat = require('../models/chat')
const File = require('../models/file')
const Chatroom_user = require('../models/chatroom_user')
const Chatroom_con_user = require('../models/chatroom_con_user')
const Chatroom = require('../models/chatroom')
const Chat_unread_user = require('../models/chat_unread_user')
const deleteRow = require('../etc/deleteRow.js');
const updateRow = require('../etc/updateRow.js');

//해당 동아리의 모든 채팅방 리스트 추출 - 테스트용
router.get('/:clubId',async(req,res,next)=>{
    try{
        const chatroom = await Chatroom.findAll({
            where:{clubId:req.params.clubId},
            include:[{
                model:Chatroom_user,
                include:[{
                    model:User
                }]
            }]
        })
        res.send(chatroom);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//해당 동아리에서 유저가 참여하는 모든 채팅방 리스트 추출
router.get('/:clubId/:userId',async(req,res,next)=>{
    try{
        const chatroom = await Chatroom.sequelize.query(`
            select c.name as clubName, cr.id as chatroomId, cr.name as chatroomName  
            from chatroom_users cu join chatrooms cr on cr.id=cu.chatroomId join clubs c on cr.clubId=c.id 
            where userId=${req.params.userId} AND clubId=${req.params.clubId};`
        )
        var list = chatroom[0];
        const obj = new Object();
        for(var i=0; i<list.length; i++){
            var clubName = list[i].clubName
            if(typeof obj[clubName] == 'undefined'){
                obj[clubName] =[list[i]]
            }else{
                obj[clubName].push(list[i]);
            }
        }
        res.send(obj);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//채팅방 슬라이드 버튼 - 사진첩, 사진이름 반환 (테스트 필요)
router.get('/:chatroomId/gallery', async (req, res, next) => {
    try {
        const images = await File.sequelize.query('SELECT f.name FROM '+
        'chatrooms cr join chats c on cr.id=c.chatroomId join on files f c.id=f.chatId '+
        `where cr.id=${req.params.chatroomId}`);
        res.send(images[0]);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//특정 채팅방의 채팅 목록 가져오기 - 역순으로 가져오는게 나을수도
router.get('/:chatroomId/chat',async(req,res,next)=>{
    try{
        const chat = await Chat.sequelize.query(
            `SELECT c.id, c.message, c.createdAt, c.userId, u.token, u.name, u.image,COALESCE(cur.count,0) as count `+
            `FROM chats c left join (select chatId,count(id) as count from chat_unread_users where chatroomId=${req.params.chatroomId} group by chatId) cur on c.id=cur.chatId join users u on c.userId=u.id `+
            `WHERE c.chatroomId=${req.params.chatroomId} order by c.id`);
        res.send(chat[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//채팅방 슬라이드 버튼 - 참여중인 유저 목록, 유저 목록 반환@
router.get('/:chatroomId/users', async (req, res, next) => {
    try {
        const users = await Chatroom_user.sequelize.query('SELECT u.name, u.image FROM '+
        'chatroom_users cu join users u on cu.userId=u.id '+
        `where cu.chatroomId=${req.params.chatroomId}`);
        res.send(users[0]);
    } catch (err) {
        console.error(err);
        next(err);
    }
});
//채팅방 입장할 경우. 읽음표시, 채팅반환, body-userId,params -chatroomid
router.get('/:chatroomId/enter/:userId', async (req, res, next) => {
    let transaction;
    try {
        var chat;
        transaction = await Chatroom_con_user.sequelize.transaction()
        await Chatroom_con_user.create({ chatroomId: req.params.chatroomId, userId: req.params.userId }, { transaction: transaction });
        await Chat_unread_user.destroy({
            where: { chatroomId: req.params.chatroomId, userId: req.params.userId}
        },{transaction:transaction}).then(async(result)=>{//유저 읽음 처리가 완료된 채팅을 반환
            chat = await Chat.sequelize.query(
                `SELECT c.id, c.message, c.createdAt, c.userId, u.token, u.name, u.image,COALESCE(cur.count,0) as count ` +
                `FROM chats c left join (select chatId,count(id) as count from chat_unread_users  where chatroomId=${req.params.chatroomId} group by chatId) cur on c.id=cur.chatId join users u on c.userId=u.id ` +
                `WHERE c.chatroomId=${req.params.chatroomId} order by c.id asc`, { transaction: transaction });
        })
        await transaction.commit();
        req.app.get('io').sockets.in(req.params.chatroomId).emit('join', chat[0]);
        res.send(chat[0]);


    } catch (err) {
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});



//새로운 메시지에 대한 점멸등과 새로운 메시지 개수 (테스트 필요)
router.get('/:clubId/:userId/flasher',async(req,res,next)=>{
    try{
        const result = await Chat_unread_user.sequelize.query(`select chatroomId, count(id) as count `+
        `from chat_unread_users cur join chatrooms c on cur.chatroomId=c.id `
        `where cur.userId=${req.params.userId} and c.clubId=${req.params.clubId}`
        `group by cur.chatroomId;`)
        res.send(result);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅방 생성@
router.post('/',async(req,res,next)=>{
    let transaction;
    try{   
        transaction = await Chatroom.sequelize.transaction();
        const chatroom = await Chatroom.create({
            name:req.body.name,
            clubId:req.body.clubId
        },{transaction:transaction});
        const userlist = req.body.user;
        for(i=0; i<userlist.length; i++){
            userlist[i]={chatroomId:chatroom.id, userId:userlist[i]};
        }
        await Chatroom_user.bulkCreate(userlist,{transaction:transaction});
        await transaction.commit();
        res.send(chatroom);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

/**
 * 0. 클라이언트 채팅방 입장: 채팅 목록을 반환하고 DB에 해당 유저가 접속중임을 기록
 * 1. 클라이언트: 채팅 전송
 * 2. 서버측: 해당 채팅기반 데이터 생성하고 생성된 chatId와 함께 새로운 메시지가 생성되었다고 클라이언트에 알림
 * 3. 클라이언트: 해당 이벤트를 수신하고, 해당 id에 해당하는 채팅을 읽겠다는 요청을함.
 * 4. 서버측: 해당 채팅을 읽음 처리하고 count가 반영된 채팅을 반환
 * 5. 클라이언트측: 응답으로 해당 채팅을 받고 뷰에 업데이트.
 * 6. 클라이언트 채팅방 퇴장: DB에 해당 유저가 접속이 끝났음을 반영
 */
//POSTMAN: 채팅 보내기@
router.post('/:chatroomId/chat', async (req, res, next) => {
    let transaction;
    try {
        transaction = await Chat.sequelize.transaction();
        const chat = await Chat.create({
            chatroomId: req.params.chatroomId,
            userId: req.body.userId,
            message: req.body.message,
        });
        const user = await Chatroom_user.sequelize.query(
            `select c.userId from chatroom_users c left outer join chatroom_con_users ccu on c.userId = ccu.userId `+
            `where ccu.id is null and c.chatroomId=${req.params.chatroomId}`
        )
        for (var i = 0; i < user[0].length; i++)
            await Chat_unread_user.create({ userId: user[0][i].userId, chatId: chat.id, chatroomId: req.params.chatroomId })
        //병렬 처리, user[0].length => count, 
        const msg = await Chat.sequelize.query(`SELECT c.id, c.message, c.createdAt, c.userId, u.token, u.name, u.image,${user[0].length} as count ` +
            `FROM chats c join users u on c.userId=u.id ` +
            `WHERE c.id=${chat.id}`)
        await transaction.commit();
        req.app.get('io').sockets.in(req.params.chatroomId).emit('new message', msg[0][0]);
    } catch (err) {
        if(transaction)
            await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅방에 유저 초대@
router.post('/:chatroomId/invite',async(req,res,next)=>{
    let transaction;
    try{
        var i;
        var userlist = req.body.user;
        transaction = await Chatroom_user.sequelize.transaction();
        for(i=0; i<userlist.length; i++){
            await Chatroom_user.findOrCreate({where:{chatroomId:req.params.chatroomId, userId:userlist[i]},transaction:transaction});
        }
        await transaction.commit();
        if(i===userlist.length)
            res.send(updateRow(1));
        else
            res.send(updateRow(0));
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅방 이름 변경, body: name 필요@
router.patch('/:chatroomId/name',async(req,res,next)=>{
    try{
        const chatroom = await Chatroom.findOne({
            where:{id:req.params.chatroomId}
        });
        chatroom.name = req.body.name;
        await chatroom.save();
        res.send(chatroom);
    }catch(err){

        console.error(err);
        next(err);
    }
});


//POSTMAN: 채팅방 알림 상태 변경
router.patch('/:chatroomId/:userId/alarm',async(req,res,next)=>{
    try{
        const user = await Chatroom_user.findOne({
            where:{chatroomId:req.params.chatroomId, userId:req.params.userId}
        });
        user.alarm = !user.alarm;
        await user.save();
        res.send(user.alarm);
    }catch(err){

        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅을 중지하는 경우-연결 유저에서 제거
router.delete('/:chatroomId/:userId/leave',async(req,res,next)=>{
    try{
        const result = await Chatroom_con_user.destroy({
            where:{chatroomId:req.params.chatroomId,userId:req.params.userId}
        })
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅방 탈퇴(leave와 다름)@
router.delete('/:chatroomId/:userId/delete',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Chatroom_user.sequelize.transaction();
        const result = await Chatroom_user.destroy({
            where:{chatroomId:req.params.chatroomId,userId:req.params.userId},transaction:transaction
        })
        await Chat_unread_user.destroy({
            where:{chatroomId:req.params.chatroomId,userId:req.params.userId},transaction:transaction
        })
        await transaction.commit();
        res.send(deleteRow(result));
    }catch(err){
        if(transaction)
            await transaction.rollback();
        console.error(err);
        next(err);
    }
});


module.exports = router;