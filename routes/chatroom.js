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

//해당 동아리의 모든 채팅방 리스트 추출
router.get('/:club_id',async(req,res,next)=>{
    try{
        const chatroom = await Chatroom.findAll({
            where:{club_id:req.params.club_id},
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

//해당 동아리에서 유저가 참여한 모든 채팅방 리스트 추출
router.get('/user/:uid',async(req,res,next)=>{
    try{
        const chatroom = await Chatroom.sequelize.query(`
            select c.name as clubName, cr.id as chatroomId, cr.name as chatroomName  
            from chatroom_users cu join chatrooms cr on cr.id=cu.chatroomId join clubs c on cr.club_id=c.id 
            where uid=${req.params.uid};`
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
router.get('/gallery/:chatroomId', async (req, res, next) => {
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
//채팅방 슬라이드 버튼 - 참여중인 유저 목록, 유저 목록 반환 (테스트 필요)
router.get('/user/:chatroomId', async (req, res, next) => {
    try {
        const users = await Chatroom_user.sequelize.query('SELECT f.name FROM '+
        'chatroom_users cu join users u on cu.uid=u.id '+
        `where cu.chatroomId=${req.params.chatroomId}`);
        res.send(users[0]);
    } catch (err) {
        console.error(err);
        next(err);
    }
});
//채팅방 입장할 경우. 읽음표시, 채팅반환, body-uid,params -chatroomid
router.get('/enter/:chatroomId/:uid', async (req, res, next) => {
    let transaction;
    try {
        var chat;
        transaction = await Chatroom_con_user.sequelize.transaction()
        await Chatroom_con_user.create({ chatroomId: req.params.chatroomId, uid: req.params.uid }, { transaction: transaction });
        await Chat_unread_user.destroy({
            where: { chatroomId: req.params.chatroomId, uid: req.params.uid}
        },{transaction:transaction}).then(async(result)=>{//유저 읽음 처리가 완료된 채팅을 반환
            chat = await Chat.sequelize.query(
                `SELECT c.id, c.message, c.createdAt, c.uid, u.token, u.name, u.image,COALESCE(cur.count,0) as count ` +
                `FROM chats c left join (select chatId,count(id) as count from chat_unread_user  where chatroomId=${req.params.chatroomId} group by chatId) cur on c.id=cur.chatId join users u on c.uid=u.id ` +
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
router.get('flasher/:club_id/:uid',async(req,res,next)=>{
    try{
        const result = await Chat_unread_user.sequelize.query(`select chatroomId, count(id) as count `+
        `from chat_unread_user cur join chatrooms c on cur.chatroomId=c.id `
        `where cur.uid=${req.params.uid} and  c.club_id=${req.params.club_id}`
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
            club_id:req.body.club_id
        },{transaction:transaction});
        const userlist = req.body.user;
        for(i=0; i<userlist.length; i++){
            userlist[i]={chatroomId:chatroom.id, uid:userlist[i]};
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

//POSTMAN: 채팅방에 유저 초대@
router.post('/invite/:chatroomId',async(req,res,next)=>{
    let transaction;
    try{
        var i;
        var userlist = req.body.user;
        transaction = await Chatroom_user.sequelize.transaction();
        for(i=0; i<userlist.length; i++){
            await Chatroom_user.findOrCreate({where:{chatroomId:req.params.chatroomId, uid:userlist[i]},transaction:transaction});
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

//POSTMAN: 채팅방 이름 변경, body: name 필요 - 테스트 필요
router.patch('/name/:chatroomId',async(req,res,next)=>{
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


//POSTMAN: 채팅방 알림 상태 변경, body: uid 필요 - 테스트 필요
router.patch('/alarm/:chatroomId',async(req,res,next)=>{
    try{
        const user = await Chatroom_user.findOne({
            where:{chatroomId:req.params.chatroomId, uid:req.body.uid}
        });
        user.alarm = !user.alarm;
        await user.save();
        res.send(user.alarm);
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
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 채팅방 삭제(leave와 다름)@
router.delete('/delete/:chatroomId/:uid',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Chatroom_user.sequelize.transaction();
        const result = await Chatroom_user.destroy({
            where:{chatroomId:req.params.chatroomId,uid:req.params.uid},transaction:transaction
        })
        await Chat_unread_user.destroy({
            where:{chatroomId:req.params.chatroomId,uid:req.params.uid},transaction:transaction
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