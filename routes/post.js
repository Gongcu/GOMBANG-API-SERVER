const express = require('express');
const router = express.Router();
const Post = require('../schemas/post');
const multer = require('multer');
const fileDeleter = require('../etc/fileDeleter.js');
const formatWriteResult = require('../etc/formatWriteResult.js');
const formatDeleteResult = require('../etc/formatDeleteResult.js');
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

//POSTMAN
router.get('/:club_id',async(req,res,next)=>{
    try{
        const post = await Post.find({club_id:req.params.club_id});
        //.populate('like_uid_list','name image').populate('participation_uid_list','name image').
        //populate('paid_uid_list','name image').populate('comment_id_list','name image');
        if(post.length===0){
            res.send('empty');
        }else{
            res.send(post);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.post('/',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
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


        const post = await Post.create({
            writer_uid: body.writer_uid,
            club_id: body.club_id,
            isNotice:body.isNotice,
            text: body.text,
            image: image,
            file: file,
            video: video,
            like_uid_list: body.like_uid_list,
            participation_fee: body.participation_fee,
            participation_uid_list: body.participation_uid_list,
            paid_uid_list: body.paid_uid_list,
            comment_id_list: body.comment_id_list,
            title: body.title,
            color: body.color,
            start_day: body.start_day,
            end_day: body.end_day,
            place: body.place,
            memo: body.memo
        });

        
        if(post.length===0){
            res.send('post create failed')
        }else{
            res.send(post);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//바꾸고 싶은 내용 외에 다른 수정정보도 넣어야함. 코드 수정할 지 고민..
router.patch('/:id',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        const prevPost = await Post.findOne({_id:req.params.id});
        fileDeleter(prevPost);

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

        const post = await Post.updateOne({_id:req.params.id},{$set:{
            isNotice:body.isNotice,
            text: body.text,
            image: image,
            file: file,
            video: video,
            participation_fee: body.participation_fee,
            title: body.title,
            color: body.color,
            start_day: body.start_day,
            end_day: body.end_day,
            place: body.place,
            memo: body.memo
        }});

        res.send(formatWriteResult(post))

    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/like/:post_id',async(req,res,next)=>{
    try{
        var result;
        const post = await Post.findOne({_id:req.params.post_id});
        if(post.length!==0){
            const exist=post.like_uid_list.indexOf(req.body.uid);
            if(exist!==-1)
                result = await Post.updateOne({_id:req.params.post_id},{$pull:{like_uid_list:req.body.uid}});
            else
                result = await Post.updateOne({_id:req.params.post_id},{$push:{like_uid_list:req.body.uid}});
        }
        res.send(formatWriteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/participation/:post_id',async(req,res,next)=>{
    try{
        var result;
        const post = await Post.findOne({_id:req.params.post_id});
        if(post.length!==0){
            const exist=post.participation_uid_list.indexOf(req.body.uid);
            if(exist!==-1)
                result = await Post.updateOne({_id:req.params.post_id},{$pull:{participation_uid_list:req.body.uid}});
            else
                result = await Post.updateOne({_id:req.params.post_id},{$push:{participation_uid_list:req.body.uid}});
        }
        res.send(formatWriteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/paid/:post_id',async(req,res,next)=>{
    try{
        var result;
        const post = await Post.findOne({_id:req.params.post_id});
        if(post.length!==0){
            const exist=post.paid_uid_list.indexOf(req.body.uid);
            if(exist!==-1)
                result = await Post.updateOne({_id:req.params.post_id},{$pull:{paid_uid_list:req.body.uid}});
            else
                result = await Post.updateOne({_id:req.params.post_id},{$push:{paid_uid_list:req.body.uid}});
        }
        res.send(formatWriteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN
router.delete('/:id',async(req,res,next)=>{
    try{
        const post = await Post.findOne({_id:req.params.id});
        const result = await Post.remove({_id:req.params.id});

        if(formatDeleteResult(result)===true){
            fileDeleter(post);
        }
        res.send(formatDeleteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;