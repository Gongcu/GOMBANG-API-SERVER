const express = require('express');
const router = express.Router();

const Sequelize=require('sequelize')
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment')
const Like = require('../models/like');
const File = require('../models/file')
const post_paid_user = require('../models/post_paid_user')
const Post_participation_user = require('../models/post_participation_user');

const multer = require('multer');
const updateRow = require('../etc/updateRow.js');
const deleteRow = require('../etc/deleteRow.js');
const fs = require('fs');
const path = require('path');
var appDir = path.dirname(require.main.filename);
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
//POSTMAN:이벤트 게시글 조회@
router.get('/event',async(req,res,next)=>{
    try{
        const post = await Post.findAll({
            where:{isEvent:true},
            include:[{
                model:Like,attributes:['uid'],
            },{
                model:Comment,attributes:['uid'],
            },{
                model:File, attributes:['name','type'],
            }],
        });
        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 동아리의 게시글 조회@
router.get('/:club_id',async(req,res,next)=>{
    try{
        const post = await Post.findAll({
            where:{club_id:req.params.club_id},
            include:[{
                model:Like,attributes:['uid'],
            },{
                model:Comment,attributes:['uid'],
            },{
                model:File, attributes:['name','type'],
            }],
        });
        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN:특정 게시글에 대한 자세한 조회@
router.get('/detail/:post_id',async(req,res,next)=>{
    try{
        const post = await Post.findOne({
            where:{id:req.params.post_id},
            include:[{
                model:File,
                attributes:['name','type']
            },{
                model:Like,
                attributes: {exclude:['id','pid']},
                include:[{
                    model:User,
                    attributes:['name','image']
                }]
            },{
                model:Comment,
                attributes: {exclude:['id','pid']},
                include:[{
                    model:User,
                    attributes:['name','image']
                }]
            },{
                model:post_paid_user,
                attributes: {exclude:['id','pid']},
                include:[{
                    model:User,
                    attributes:['name']
                }]
            },{
                model:Post_participation_user,
                attributes: {exclude:['id','pid']},
                include:[{
                    model:User,
                    attributes:['name']
                }]
            }]
        });
        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 특정 게시글의 댓글 조회@
router.get('/comment/:post_id',async(req,res,next)=>{
    try{
        const comments = await Comment.findAll({
            where:{pid:req.params.post_id},
            include:[{
                model:User
            }]
        })
        res.send(comments);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 게시글 작성@
router.post('/',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        const post = await Post.create({
            uid: req.body.uid,
            club_id: req.body.club_id,
            text: req.body.text,
            isNotice:req.body.isNotice,
            participation_fee: req.body.participation_fee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo
        });

        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({pid:post.id,type:"file",name:req.files['file'][i].filename})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({pid:post.id,type:"image",name:req.files['image'][i].filename})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({pid:post.id,type:"video",name:req.files['video'][i].filename})
        }

        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 이벤트 글 작성@
router.post('/event',uploader.fields([{name:'banner'},{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        if(typeof req.files['banner']=='undefined'){
            res.send("banner required")
        }

        const post = await Post.create({
            uid: req.body.uid,
            club_id: req.body.club_id,
            isNotice:req.body.isNotice,
            isEvent:true,
            text: req.body.text,
            participation_fee: req.body.participation_fee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo
        });
        await File.create({pid:post.id,type:"banner",name:req.files['banner'][0].filename})
        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({pid:post.id,type:"file",name:req.files['file'][i].filename})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({pid:post.id,type:"image",name:req.files['image'][i].filename})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({pid:post.id,type:"video",name:req.files['video'][i].filename})
        }

        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 작성@
router.post('/comment/:post_id',async(req,res,next)=>{
    try{
        const comment = await Comment.create({
            pid:req.params.post_id,
            uid: req.body.uid,
            comment: req.body.comment,
        });
        res.send(comment);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 게시글 수정@
router.patch('/:id',uploader.fields([{name:'banner'},{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        //(글 수정 -> 파일 DB 삭제 후 추가)->성공 시 스토리지의 이전 게시글 파일 삭제 
        const post = await Post.update({
            uid: req.body.uid,
            club_id: req.body.club_id,
            isNotice:req.body.isNotice,
            isEvent:req.body.isEvent,
            text: req.body.text,
            participation_fee: req.body.participation_fee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo
        },{
            where:{id:req.params.id}
        });
        const prevFiles = await File.findAll({pid:req.params.id})
        await File.destroy({
            where:{pid:req.params.id}
        }).then(async(files)=>{
            console.log(files);
            if(req.body.isEvent===true){
                if(typeof req.files['banner']=='undefined'){
                    res.send("banner required")
                }else{
                    await File.create({pid:req.params.id,type:"banner",name:req.files['banner'][0].filename})
                }
            }
            if(typeof req.files['file']!='undefined'){
                for(var i=0; i<req.files['file'].length; i++)
                    await File.create({pid:req.params.id,type:"file",name:req.files['file'][i].filename})
            }
            if(typeof req.files['image']!='undefined'){
                for(var i=0; i<req.files['image'].length; i++)
                    await File.create({pid:req.params.id,type:"image",name:req.files['image'][i].filename})
            }
            if(typeof req.files['video']!='undefined'){
                for(var i=0; i<req.files['video'].length; i++)
                    await File.create({pid:req.params.id,type:"video",name:req.files['video'][i].filename})
            }
        }).then((result)=>{
            console.log(result);
            for(var i=0; i<prevFiles.length; i++){
                fs.unlink(appDir + '/upload/' + prevFiles[i].name, (err) => {
                    console.log(err);
                });
            }
        })
        

        res.send(updateRow(post))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 수정@
router.patch('/comment/:comment_id',async(req,res,next)=>{
    try{
        const comment = await Comment.update({
            comment:req.body.comment
        },{
            where:{id:req.params.comment_id}
        })
        res.send(updateRow(comment));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 게시글 좋아요@
router.patch('/like/:post_id', async (req, res, next) => {
    try {
        await Like.findOrCreate({
            where: { pid: req.params.post_id, uid: req.body.uid }
        }).then(async (result) => {
            if(result[1]){
                res.send("on")
            }else{
                await Like.destroy({
                    where: { pid: req.params.post_id, uid: req.body.uid }
                })
                res.send("off")
            }
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 게시글 참여하기 클릭@
router.patch('/participation/:post_id',async(req,res,next)=>{
    try {
        await Post_participation_user.findOrCreate({
            where: { pid: req.params.post_id, uid: req.body.uid }
        }).then(async (result) => {
            if(result[1]){
                res.send("on")
            }else{
                await Post_participation_user.destroy({
                    where: { pid: req.params.post_id, uid: req.body.uid }
                })
                res.send("off")
            }
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 특정 유저 금액 지불 클릭@
router.patch('/paid/:post_id',async(req,res,next)=>{
    try{
        await post_paid_user.findOrCreate({
            where: { pid: req.params.post_id, uid: req.body.uid }
        }).then(async (result) => {
            if(result[1]){
                res.send("on")
            }else{
                await post_paid_user.destroy({
                    where: { pid: req.params.post_id, uid: req.body.uid }
                })
                res.send("off")
            }
        })
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 게시글 삭제@ onDelete:CASCADE, like, paid,.. 등에 해당 pid 갖는 로우 모두 삭제됨
router.delete('/:id',async(req,res,next)=>{
    try{
        const files = await File.findAll({
            where:{pid:req.params.id}
        });
        for(var i=0; i<files.length; i++){
            fs.unlink(appDir + '/upload/' + files[i].name, (err) => {
                console.log(err);
            });
        }
        const result = await Post.destroy({
            where:{id:req.params.id}
        })
        res.send(deleteRow(result))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 삭제@
router.delete('/comment/:comment_id',async(req,res,next)=>{
    try{
        const result = await Comment.destroy({
            where:{id:req.params.comment_id}
        })
        res.send(deleteRow(result))
    }catch(err){
        console.error(err);
        next(err);
    }
});



module.exports = router;