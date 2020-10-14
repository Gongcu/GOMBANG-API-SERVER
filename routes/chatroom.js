const express = require('express');
const router = express.Router();
const User = require('../models/user')
const Chat = require('../models/chat')
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