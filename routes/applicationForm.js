const express = require('express');
const router = express.Router();
const Club = require('../models/club');
const Club_user = require('../models/club_user');
const User = require('../models/user')
const Alarm = require('../models/alarm');
const ApplicationForm = require('../models/applicationForm');
const deleteRow = require('../etc/deleteRow');
const fcmPushGenerator = require('../fcm/fcmPushGenerator');


//POSTMAN: 해당 동아리로 작성된 가입신청서 목록 조회@
router.get('/:clubId',async(req,res,next)=>{
    try{
        const applicationform = await ApplicationForm.findAll({
            where:{clubId:req.params.clubId}
        })
        if(applicationform.length)
            res.status(200).send(applicationform);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//특정유저(userId)가 특정 동아리(clubId)의 가입신청서를 작성하러 들어갈 때
//아래 요청의 결과가 존재할 경우 응답으로 기존 가입신청서 전달
// --> 기존에 작성한 가입신청서가 있습니다~~ 기존 작성한 내용을 수정하시겠습니까?
//결과가 존재하지 않을 경우 응답으로 null이 전달
// --> 새로 작성하면 된다.
router.get('/:clubId/:userId',async(req,res,next)=>{
    try{
        const applicationform = await ApplicationForm.findOne({
            where:{userId:req.params.userId,clubId:req.params.clubId}
        })
        if(applicationform)
            res.status(200).send(applicationform);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 신청서 작성@ + PUSH
router.post('/:clubId', async (req, res, next) => {
    let transaction;
    try {
        transaction = await ApplicationForm.sequelize.transaction();
        var itemCheck = await ApplicationForm.findOne({
            where: { userId: req.body.userId, clubId: req.params.clubId },
            transaction:transaction
        });
        //기존 신청서가 존재할 경우 제거
        if (itemCheck !== null) {
            await ApplicationForm.destroy({
                where: { id:itemCheck.id },
                transaction:transaction
            });
        }
        const applicationform = await ApplicationForm.create({
            userId: req.body.userId,
            clubId: req.params.clubId,
            name: req.body.name,
            nickname: req.body.nickname,
            gender: req.body.gender,
            birth: req.body.birth,
            campus: req.body.campus,
            college: req.body.college,
            department: req.body.department,
            studentNumber: req.body.studentNumber,
            phone: req.body.phone,
            residence: req.body.residence,
            experience: req.body.experience
        },{transaction:transaction});

        //PUSH
        var token = new Array()
        const managers = await Club_user.sequelize.query(
            'SELECT u.id, u.token ' +
            `FROM club_users cu join users u on cu.userId=u.id ` +
            `WHERE cu.clubId=${req.params.clubId} and cu.authority NOT LIKE '멤버' and u.pushAlarm=true and cu.alarm = true `, { transaction: transaction });

        for(var i=0; i<managers[0].length; i++){
            token[i]=managers[0][i].token

            await Alarm.create({
                content:"새로운 가입 신청서가 작성되었습니다.",
                clubId:applicationform.clubId,
                applicationFormId:applicationform.id,
                userId:managers[0][i].id
            },{transaction:transaction});
        }

        fcmPushGenerator(token, "새로운 가입 신청서가 작성되었습니다.",applicationform.id,"application")

        await transaction.commit()
        res.status(200).send(applicationform);
    } catch (err) {
        if(transaction) await transaction.rollback()
        console.error(err);
        next(err);
    }
});

//POSTMAN: 신청서 승인@ + PUSH
router.patch('/:applicationFormId/approve',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await ApplicationForm.sequelize.transaction()

        const applicationForm = await ApplicationForm.findOne({
            where:{id:req.params.applicationFormId,isApproved:false},
            transaction:transaction
        });
        applicationForm.isApproved = true;
        await applicationForm.save({transaction:transaction});

        //유저 가입
        const result = await Club_user.create({
            userId:applicationForm.userId,
            clubId:applicationForm.clubId,
            nickname:applicationForm.nickname,
        },{transaction:transaction});

        //동아리원 수 +1
        const club = await Club.findOne({
            where:{id:applicationForm.clubId},transaction:transaction
        });
        club.memberCount += 1;
        await club.save({transaction:transaction});

        //알람
        await Alarm.create({
            content:"동아리에 가입되었습니다.",
            clubId:applicationForm.clubId,
            userId:applicationForm.userId
        },{transaction:transaction});

        //PUSH
        const user = await User.sequelize.query(
            `SELECT id, token FROM users WHERE id=${applicationForm.userId} and pushAlarm = true`,
            {transaction:transaction}
        )

        var token = new Array()
        token[0]=user[0][0].token
        fcmPushGenerator(token, "동아리에 가입되었습니다.",applicationForm.clubId,"club")

        await transaction.commit()

        if(result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        if(transaction) await transaction.rollback()
        console.error(err);
        next(err);
    }
});

//POSTMAN: 가입 신청서 삭제(거절)@ + PUSH
router.delete('/:applicationFormId',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await ApplicationForm.sequelize.transaction();
        var deleteForm = await ApplicationForm.findOne({
            where:{id:req.params.applicationFormId},
            transaction:transaction
        });
        await Alarm.create({
            content:"가입신청이 거부되었습니다.",
            clubId:deleteForm.clubId,
            userId:deleteForm.userId
        },{transaction:transaction});
        const result = await deleteForm.destroy({transaction:transaction});

        //PUSH
        const user = await User.sequelize.query(
            `SELECT id,token FROM users WHERE id=${deleteForm.userId} and pushAlarm = true`,
            {transaction:transaction}
        );

        var token = new Array()
        token[0]=user[0][0].token
        fcmPushGenerator(token, "가입신청이 거부되었습니다.",deleteForm.clubId,"club")

        await transaction.commit()
        
        if(deleteRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

module.exports = router;