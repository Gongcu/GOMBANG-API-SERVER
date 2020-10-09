const express = require('express');
const router = express.Router();

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

//POSTMAN:특정 동아리의 게시글 조회@
router.get('/:club_id',async(req,res,next)=>{
    try{
        const post = await Post.findAll({
            where:{club_id:req.params.club_id},
            include:[{
                model:File,
            },{
                model:Like,
                include:[{
                    model:User,
                    attributes:['name','image']
                }]
            },{
                model:Comment,//모델안에 중첩해서 include가능:https://velog.io/@rjsdnql123/Solo-Project-3-Sequelize-%EC%97%AC%EB%9F%AC-%EB%AA%A8%EB%8D%B8-include%ED%95%98%EA%B8%B0
            },{
                model:post_paid_user,
            },{
                model:Post_participation_user,
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

/*
//바꾸고 싶은 내용 외에 다른 수정정보도 넣어야함. 코드 수정할 지 고민..
//1. 유저가 수정 클릭.
//2. 기존의 모든 정보가 수정 페이지에 업로드
//3. 그 정보 전체다 보내기. (사실상 _id만 안바뀌고 새로운 post 한거임)
//이미지가 수정되었을 경우..
router.patch('/:id',uploader.fields([{name:'banner'},{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    try{
        const prevPost = await Post.findOne({_id:req.params.id});
        fileDeleter(prevPost);//이거 맨 마지막으로 옮기는게 좋을듯 수정 완료 되고 삭제하게

        const body = JSON.parse(req.body.json)
        var banner;
        var file=new Array(), image=new Array(), video=new Array();

        if(typeof req.files['banner']!='undefined'){
            banner=req.files['banner'][0].filename;
        }else{
            res.send('Banner is required')
        }

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


        //$set 내부에 정의된 값들은 존재하지 않는다면 null이나 empty로 초기화됨에 유의
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
});*/

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