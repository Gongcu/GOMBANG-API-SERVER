const express = require('express');

const Question = require('../models/question');
const Answer = require('../models/answer');

const updateRow = require('../etc/updateRow');
const deleteRow = require('../etc/deleteRow');
const router = express.Router();


//POSTMAN, 해당하는 동아리의 질문, 답변 목록을 전부 가져옴
router.get('/:club_id',async(req,res,next)=>{
    try{
        const question = await Question.findAll({
            where:{club_id:req.params.club_id},
            include:[{
                model:Answer,
            }]
        })
        res.send(question);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 질문 작성@
router.post('/question',async(req,res,next)=>{
    try{
        const question = await Question.create({
                club_id: req.body.club_id,
                uid: req.body.uid,
                question: req.body.question,
                //reatedAt은 질문 생성시 default 처리
        });
        res.send(question)
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN, 답글 작성시 답글 생성후 질문 id에 해당하는 로우의 answer 값을 answer의 id로 업데이트.
router.post('/answer',async(req,res,next)=>{
    try{
        const answer = await Answer.create({
            answer: req.body.answer,
        });
        const question = await Question.update({
            aid:answer.id
        }, {
            where:{id:req.body.question_id}
        })
        res.send(answer);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:질문수정
router.patch('/question/:id',async(req,res,next)=>{
    try{
        const question = await Question.findOne({where:{id:req.params.id, aid:null}})
        if(question){
            question.question=req.body.question;
            await question.save();
            res.send(question);
        }else{
            res.send(updateRow(0))
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:질문 수정
router.patch('/answer/:id',async(req,res,next)=>{
    try{
        const answer = await Answer.findOne({where:{id:req.params.id}});
        if(answer){
            answer.answer=req.body.answer;
            await answer.save();
            res.send(answer);
        }else{
            res.send(updateRow(0))
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 질문 삭제, 답변이 존재할 경우 답변도 삭제, 답변 없는거 삭제 테스트 해보기
router.delete('/question/:id',async(req,res,next)=>{
    try{
        const question = await Question.findOne({
            where:{id:req.params.id}
        });
        await Question.destroy({
            where:{id:req.params.id}
        });
        const result = await Answer.destroy({
            where:{id:question.aid}
        });
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 답변 삭제
router.delete('/answer/:id',async(req,res,next)=>{
    try{
        const answer = await Answer.findOne({
            where:{id:req.params.id}
        });
        const result = await Answer.destroy({
            where:{id:req.params.id}
        });
        await Question.update({
            aid:null
        },{
            where:{aid:answer.id}
        })
        res.send(deleteRow(result))
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;
