const express = require('express');
const Question = require('../models/question');
const Answer = require('../models/answer');
const Alarm = require('../models/alarm');
const updateRow = require('../etc/updateRow');
const deleteRow = require('../etc/deleteRow');
const nodemailer = require('nodemailer');
const Club_user = require('../models/club_user');
const Sequelize = require('sequelize');

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

//POSTMAN: APP으로 보낸 나의 문의사항 
router.get('/app/:uid',async(req,res,next)=>{
    try{
        const question = await Question.findAll({
            where:{uid:req.params.uid, club_id:null},
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

//POSTMAN: 질문 작성@ + PUSH
router.post('/question',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Question.sequelize.transaction();
        const question = await Question.create({
                club_id: req.body.club_id,
                uid: req.body.uid,
                question: req.body.question,
                //createdAt은 질문 생성시 default 처리
        },{transaction:transaction});
        const managers = await Club_user.findAll({
            where:{club_id:req.body.club_id, authority:{[Sequelize.Op.not]:'멤버'}},
            attributes:['uid']
        })
        for(var i=0; i<managers.length; i++){
            await Alarm.create({
                content:"새로운 문의사항이 작성되었습니다.",
                club_id: req.body.club_id,
                question_id:question.id,
                uid:managers[i].uid
            },{transaction:transaction});
        }
        await transaction.commit();
        res.send(question)
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 앱으로 질문 작성@
router.post('/app/question', async (req, res, next) => {
    try {
        const question = await Question.create({
            uid: req.body.uid,
            question: req.body.question,
            //createdAt은 질문 생성시 default 처리
        });
        const emailAddress =  'gombangapp@gmail.com'
 
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });

        let mailOptions = await transporter.sendMail({
            from: `곰방`,
            to: emailAddress,
            subject: '새로운 문의사항이 등록되었습니다',
            text: '새로운 문의사항이 등록되었습니다',
        });

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            console.log("Finish sending email : " + info.response);
            transporter.close()
        });
        res.send(question)
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 답글 작성@ + PUSH
router.post('/answer',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Answer.sequelize.transaction();
        const answer = await Answer.create({
            answer: req.body.answer,
        },{transaction:transaction});
        const question = await Question.findOne({
            where:{id:req.body.question_id},transaction:transaction
        });
        question.aid = answer.id;
        await question.save({transaction:transaction});
        await Alarm.create({
            content:"질문에 답변이 작성되었습니다.",
            club_id:question.club_id,
            question_id:req.body.question_id,
            uid:question.uid
        },{transaction:transaction});
        await transaction.commit();
        res.send(answer);
    }catch(err){
        if(transaction) await transaction.rollback();
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

//POSTMAN: 질문 삭제, 답변이 존재할 경우 답변도 삭제@
router.delete('/question/:id',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Question.sequelize.transaction();
        const question = await Question.findOne({
            where:{id:req.params.id}
        });
        await Question.destroy({
            where:{id:req.params.id}
        });
        const result = await Answer.destroy({
            where:{id:question.aid}
        });
        await transaction.commit();
        res.send(deleteRow(result));
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 답변 삭제
router.delete('/answer/:id',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Question.sequelize.transaction();
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
        await transaction.commit();
        res.send(deleteRow(result))
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

module.exports = router;
