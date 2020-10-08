const express = require('express');
const Question = require('../schemas/question');
const Answer = require('../schemas/answer');
const formatWriteResult = require('../etc/formatWriteResult');
const formatDeleteResult = require('../etc/formatDeleteResult');
const router = express.Router();


//POSTMAN, 해당하는 동아리의 질문, 답변 목록을 전부 가져옴
router.get('/:club_id',async(req,res,next)=>{
    try{
        const question = await Question.find({club_id:req.params.club_id}).populate('answer').populate('uid','name');
        res.send(question);
    }catch(err){
        console.error(err);
        next(err);
    }
});
//테스트용
router.get('/answer',async(req,res,next)=>{
    try{
        const answer = await Answer.find({});
        res.send(answer);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN, 질문 작성
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


//POSTMAN, 답글 작성시 답글 생성후 질문 id에 해당하는 로우의 answer 값을 answer의 id로 업데이트.
router.post('/answer',async(req,res,next)=>{
    try{
        const answer = await Answer.create({
            question: req.body.question_id,
            uid: req.body.uid,
            answer: req.body.answer,
        });
        if(answer===null){
            res.send(false)
        }
        const question = await Question.update({_id:req.body.question_id},{answer:answer._id, isAnswered:true});
        res.send(formatWriteResult(question));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/question/:id',async(req,res,next)=>{
    try{
        const question = await Question.updateOne({_id:req.params.id,isAnswered:false},{$set:{question:req.body.question}});
        res.send(formatWriteResult(question))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/answer/:id',async(req,res,next)=>{
    try{
        const answer = await Answer.updateOne({_id:req.params.id},{$set:{answer:req.body.answer}});
        res.send(formatWriteResult(answer));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.delete('/question/:id',async(req,res,next)=>{
    try{
        const question = await Question.findOneAndDelete({_id:req.params.id});
        if(question.isAnswered===true){
            await Answer.deleteOne({_id:question.answer})
        }
        res.send(formatDeleteResult(question))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.delete('/answer/:id',async(req,res,next)=>{
    try{
        const question = await Question.updateOne({answer:req.params.id},{$set:{answer:"",isAnswered:false}});
        const answer = await Answer.findOneAndDelete({_id:req.params.id});
        res.send(formatDeleteResult(question))
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;
