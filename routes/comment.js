const express = require('express');
const Comment = require('../schemas/comment');
const Event = require('../schemas/event');
const Post = require('../schemas/post');


const path = require('path');

var appDir = path.dirname(require.main.filename);

const router = express.Router();

//쿼리로 달 별로 가져오게 할 건지 아니면 전체 다 가져오게 할 지 -> 성능상 무엇이 좋을까
router.get('/:uid',async(req,res,next)=>{
    try{
        const comment = await Comment.find({uid:req.params.uid})
        if(comment.length===0){
            res.send('empty');
        }else{
            res.send(comment);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//댓글이 작성되면 이벤트 혹은 포스트에 반영이 되어야한다.
router.post('/:document',async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        const comment = await Comment.create({
                uid: body.uid,
                comment: body.comment,
        });

        if(comment.length===0){
            res.send('club create failed')
        }else{
            res.send(comment);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id',async(req,res,next)=>{
    try{
        const comment = await Comment.remove({_id:req.params.id});
        res.send(comment);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;