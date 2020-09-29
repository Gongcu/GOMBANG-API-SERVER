const express = require('express');
const router = express.Router();
const Chat = require('../schemas/chat')


//특정 채팅방의 채팅 목록 가져오기 - 역순으로 가져오는게 나을수도
router.get('/:chatroom_id',async(req,res,next)=>{
    try{
        const chat = await Chat.find({chatroom_id:req.params.chatroom_id}).populate('uid', 'name image');
        res.send(chat);
    }catch(err){
        console.error(err);
        next(err);
    }
});


router.post('/:chatroom_id',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
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

        const chat = await Chat.create({
            chatroom_id: body.chatroom_id,
            uid: body.uid,
            message:body.message,
            image: image,
            file: file,
            video: video,
            contact: contact,
            unread_uid_list: body.unread_uid_list,
        });

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



module.exports = router;