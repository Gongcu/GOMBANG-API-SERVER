const express = require('express');
const Comment = require('../schemas/comment');
const Question = require('../schemas/question');
const Answer = require('../schemas/answer');

const path = require('path');

const router = express.Router();

//해당하는 동아리의 질문, 답변 목록을 전부 가져옴
router.get('/:club_id',async(req,res,next)=>{
    try{
        const question = await Question.find({_id:req.params.club_id}).populate('answer');
        if(question.length===0){
            res.send('empty');
        }else{
            res.send(question);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//질문 작성
router.post('/question',async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        const question = await Question.create({
                club_id: body.club_id,
                uid: body.uid,
                question: body.question,
                //answer, isAnswerd, createdAt은 질문 생성시 default 처리
        });

        if(question.length===0){
            res.send('question create failed')
        }else{
            res.send(question);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//댓글 작성시 댓글 생성후 질문 id에 해당하는 로우의 answer 값을 answer의 id로 업데이트.
router.post('/answer',async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        const questionId =body.questionId;
        const answer = await Answer.create({
                uid: body.uid,
                answer: body.answer,
                //createdAt은 답변 생성시 default 처리
        });

        if(answer.length===0){
            res.send('question create failed');
        }else{
            const question = await Question.update({_id:questionId},{answer:answer._id})
            if(question.length===0)
                res.send('question update failed');
            else
                res.send(question);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.put('/question/:id',async(req,res,next)=>{
    try{
        const updatedQuestion = req.body.question;
        const question = await Question.update({_id:req.params.id},{question:updatedQuestion});
        if(question.length===0)
            res.send('question update failed');
        else
            res.send(question);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.put('/answer/:id',async(req,res,next)=>{
    try{
        const updatedAnswer = req.body.answer;
        const answer = await Answer.update({_id:req.params.id},{answer:updatedAnswer});
        if(answer.length===0)
            res.send('answer update failed');
        else
            res.send(answer);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/question/:id',async(req,res,next)=>{
    try{
        const question = await Question.remove({_id:req.params.id});
        if(question.length===0)
            res.send('question delete failed');
        else
            res.send(answer);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/answer/:id',async(req,res,next)=>{
    try{
        const answer = await Answer.remove({_id:req.params.id});
        if(answer.length===0)
            res.send('answer delete failed');
        else
            res.send(answer);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;