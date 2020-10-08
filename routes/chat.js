const express = require('express');
const router = express.Router();
const Chat = require('../schemas/chat')
const ChatRoom = require('../schemas/chatroom')
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

//특정 채팅방의 채팅 목록 가져오기 - 역순으로 가져오는게 나을수도
router.get('/:chatroom_id',async(req,res,next)=>{
    try{
        const chat = await Chat.find({chatroom_id:req.params.chatroom_id}).populate('uid','image name');
        console.log(chat)
        res.send(chat);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:chatroom_id',async(req,res,next)=>{
    try{   
        const chatroom = await ChatRoom.findOne({_id:req.params.chatroom_id});
        var chat = await Chat.create({
            chatroom_id: req.params.chatroom_id,
            uid: req.body.uid,
            message:req.body.message,
            unread_uid_list: chatroom.participation_uid_list,
        });
        chat = chat.populate('uid','name image',(err,chat)=>{
            console.log(chat)
            req.app.get('io').sockets.in(req.params.chatroom_id).emit('new message', chat);
        })

        if(chat.length===0){
            res.send('chat create failed')
        }else{
            res.send(chat);
        }
    }catch(err){
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



module.exports = router;