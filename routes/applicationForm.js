const express = require('express');
const router = express.Router();
const User = require('../schemas/user');
const Club = require('../schemas/club');
const ApplicationForm = require('../schemas/applicationForm');
const formatWriteResult = require('../etc/formatWriteResult.js');
const formatDeleteResult = require('../etc/formatDeleteResult.js');
const formatDateTime = require('../etc/formatDateTime.js');


//해당 동아리로 작성된 가입신청서 목록 조회
router.get('/:club_id',async(req,res,next)=>{
    try{
        const applicationform = await ApplicationForm.find({club_id:req.params.club_id})//.populate('post_id_list');
        res.send(applicationform);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//특정유저(uid)가 특정 동아리(club_id)의 가입신청서를 작성하러 들어갈 때
//위 요청의 결과가 존재할 경우 응답으로 기존 가입신청서 전달
// --> 기존에 작성한 가입신청서가 있습니다~~ 기존 작성한 내요을 수정하시겠습니까?
//결과가 존재하지 않을 경우 응답으로 null이 전달
// --> 새로 작성하면 된다.
router.get('/:club_id/:uid',async(req,res,next)=>{
    try{
        const applicationform = await ApplicationForm.findOne({uid:req.params.uid,club_id:req.params.club_id})//.populate('post_id_list');
        res.send(applicationform);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.post('/:club_id', async (req, res, next) => {
    try {
        var itemCheck = await ApplicationForm.findOne({uid:req.body.uid,club_id:req.params.club_id});
        //기존 신청서가 존재할 경우 제거
        if(itemCheck!==null){
            itemCheck = await ApplicationForm.findOneAndRemove({uid:req.body.uid,club_id:req.params.club_id});
            //기존 신청서로 인해 등록된 동아리의 닉네임 제거 필요
            await Club.updateOne({_id:req.params.club_id}, {$pull:{nickname:itemCheck.nickname}});
        }

        //새로 입력한 닉네임 사용 가능 여부 확인
        const exist = await Club.findOne({_id:req.params.cid,"used_nickname_list.nickname":req.body.nickname});
        if(exist!==null){
            res.send(req.body.nickname+' already exists') //End of the request
        }
        
        const applicationform = await ApplicationForm.create({
            uid: req.body.uid,
            club_id: req.body.club_id,
            name: req.body.name,
            nickname: req.body.nickname,
            gender: req.body.gender,
            birth: req.body.birth,
            campus: req.body.campus,
            college: req.body.college,
            department: req.body.department,
            student_number: req.params.student_number,
            phone: req.body.phone,
            residence: req.body.residence,
            experience: req.body.experience
        });

        if(applicationform!==null){
            //닉네임 추가
            var pushedNickname={
                uid:req.body.uid,
                nickname:req.body.nickname
            }
            await Club.updateOne({_id:req.params.club_id},{$push:{used_nickname_list:pushedNickname}});
        }

        res.send(applicationform);
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/approve/:af_id',async(req,res,next)=>{
    try{
        var result = await ApplicationForm.findOneAndUpdate({_id:req.params.af_id,isApproved:false},{$set:{isApproved:true}});

        if(result!==null){
            const club = await Club.updateOne({_id:result.club_id},{$push:{member_uid_list:result.uid}});
            const user = await User.updateOne({_id:result.uid},{$push:{signed_club_list:result.club_id}});
            if(formatWriteResult(club)===false && formatWriteResult(club)===true){
                await Club.updateOne({_id:result.club_id},{$pull:{member_uid_list:result.uid}});
            }else if(formatWriteResult(club)===true && formatWriteResult(club)===false){
                await User.updateOne({_id:result.uid},{$pull:{signed_club_list:result.club_id}});
            }
            if(formatWriteResult(club)===true && formatWriteResult(user)===true)
                res.send(true);
            else
                res.send(false);
        }else{
            res.send('false:The applicationform is already approved or does not exist(_id)')
        }
        
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.delete('/:af_id',async(req,res,next)=>{
    try{
        var result = await ApplicationForm.findOneAndRemove({_id:req.params.af_id});
        await Club.updateOne({_id:req.params.club_id}, {$pull:{used_nickname_list:{nickname:result.nickname}}});
        res.send(formatDeleteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;