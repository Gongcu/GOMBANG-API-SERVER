const express = require('express');
const router = express.Router();


const Club_user = require('../models/club_user');
const ApplicationForm = require('../models/applicationForm');

const deleteRow = require('../etc/deleteRow');


//POSTMAN: 해당 동아리로 작성된 가입신청서 목록 조회@
router.get('/:club_id',async(req,res,next)=>{
    try{
        const applicationform = await ApplicationForm.findAll({
            where:{cid:req.params.club_id}
        })
        res.send(applicationform);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//특정유저(uid)가 특정 동아리(club_id)의 가입신청서를 작성하러 들어갈 때
//아래 요청의 결과가 존재할 경우 응답으로 기존 가입신청서 전달
// --> 기존에 작성한 가입신청서가 있습니다~~ 기존 작성한 내용을 수정하시겠습니까?
//결과가 존재하지 않을 경우 응답으로 null이 전달
// --> 새로 작성하면 된다.
router.get('/:club_id/:uid',async(req,res,next)=>{
    try{
        const applicationform = await ApplicationForm.findOne({
            where:{uid:req.params.uid,cid:req.params.club_id}
        })//.populate('post_id_list');
        res.send(applicationform);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 신청서 작성@
router.post('/:club_id', async (req, res, next) => {
    try {
        var itemCheck = await ApplicationForm.findOne({
            where: { uid: req.body.uid, cid: req.params.club_id }
        });
        //기존 신청서가 존재할 경우 제거
        if (itemCheck !== null) {
            await ApplicationForm.destroy({
                where: { id:itemCheck.id }
            });
        }
        const applicationform = await ApplicationForm.create({
            uid: req.body.uid,
            cid: req.body.club_id,
            name: req.body.name,
            nickname: req.body.nickname,
            gender: req.body.gender,
            birth: req.body.birth,
            campus: req.body.campus,
            college: req.body.college,
            department: req.body.department,
            student_number: req.body.student_number,
            phone: req.body.phone,
            residence: req.body.residence,
            experience: req.body.experience
        });

        res.send(applicationform);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 신청서 승인@
router.patch('/approve/:af_id',async(req,res,next)=>{
    try{
        const applicationForm = await ApplicationForm.findOne({
            where:{id:req.params.af_id}
        });
        await ApplicationForm.update({
            isApproved:true
            },{
            where:{id:req.params.af_id,isApproved:false}
        });
        const result = await Club_user.create({
            uid:applicationForm.uid,
            cid:applicationForm.cid,
            nickname:applicationForm.cid,
        });
        if(result)
            res.send(true)
        else
            res.send(false) 
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 가입 신청서 삭제@
router.delete('/:af_id',async(req,res,next)=>{
    try{
        var result = await ApplicationForm.destroy({
            where:{id:req.params.af_id}
        });
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;