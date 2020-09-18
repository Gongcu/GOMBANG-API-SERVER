const express = require('express');
const Question = require('../schemas/question');
const Answer = require('../schemas/answer');
const answer = require('../schemas/answer');
const router = express.Router();


//해당하는 동아리의 질문, 답변 목록을 전부 가져옴
router.get('/:club_id',async(req,res,next)=>{
    try{
        const question = await Question.find({club_id:req.params.club_id}).populate('answer').populate('uid','name');
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
        const question = await Question.create({
                club_id: req.body.club_id,
                uid: req.body.uid,
                question: req.body.question,
                //answer, isAnswered, createdAt은 질문 생성시 default 처리
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

//답글 작성시 답글 생성후 질문 id에 해당하는 로우의 answer 값을 answer의 id로 업데이트.
router.post('/answer',async(req,res,next)=>{
    try{
        const question_id =req.body.question_id;
        const answer = await Answer.create({
                uid: req.body.uid,
                answer: req.body.answer,
                //createdAt은 답변 생성시 default 처리
        });
        if(answer.length===0){
            res.send('question create failed');
        }else{
            const question = await Question.update({_id:question_id},{answer:answer._id, isAnswered:true});
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

router.patch('/question/:id',async(req,res,next)=>{
    try{
        const updatedQuestion = req.body.question;
        const question = await Question.updateOne({_id:req.params.id},{$set:{question:updatedQuestion}});
        if(question.length===0)
            res.send('question update failed');
        else
            res.send(question);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.patch('/answer/:id',async(req,res,next)=>{
    try{
        const updatedAnswer = req.body.answer;
        const answer = await Answer.updateOne({_id:req.params.id},{$set:{answer:updatedAnswer}});
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


/*
[
    {
        "question": "안녕하세요",
        "isAnswered": false,
        "createdAt": "1600410099750",
        "_id": "5f6451f53e5c7875306aedef",
        "club_id": "5f4fa1623fabdf5f285bdc0a",
        "uid": "5f4fa0073fabdf5f285bdc08",
        "__v": 0,
        "answer": {
            "createdAt": "1600411611052",
            "_id": "5f6457dc0433200aacce3eb3",
            "uid": "5f4fa0073fabdf5f285bdc08",
            "answer": "안녕하세요",
            "__v": 0
        }
    }
]
*/ 
