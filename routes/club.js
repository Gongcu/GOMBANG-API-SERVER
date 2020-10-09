const express = require('express');
const deleteRow = require('../etc/deleteRow.js');
const updateRow = require('../etc/updateRow.js');

const Club = require('../models/club');
const Club_user = require('../models/club_user');
const User = require('../models/user');
const Hashtag = require('../models/hashtag');

const multer = require('multer');
const path = require('path');
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
const fs = require('fs');
var appDir = path.dirname(require.main.filename);

const router = express.Router();

//POSTMAN
router.get('/',async(req,res,next)=>{
    try{
        const club = await Club.findAll({});
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.findOne({
            where:{id:req.params.club_id},
        });
        //443p N:M관계 에제:해시태그
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});
/*
//POSTMAN: 동아리 내 작성글
router.get('/:club_id/:uid/mypost/',async(req,res,next)=>{
    try{
        const post = await Post.find({club_id:req.params.club_id,writer_uid:req.params.uid});//.populate('member_uid_list')//.populate('manager_uid_list');
        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});
*/
//POSTMAN 닉네임 사용가능 여부@
router.get('/:club_id/nickname/:nickname',async(req,res,next)=>{
    try{
        var result = await Club_user.findOne({
            where:{cid:req.params.club_id,nickname:req.params.nickname}
        });
        if(result){
            res.send(false);
        }else{
            res.send(true);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});





//POSTMAN: 동아리 회원 리스트@
router.get('/:club_id/member',async(req,res,next)=>{
    try{
        const member = await Club_user.findAll({
           where:{cid:req.params.club_id},
           include:[{
                model:User
           }]
        });
        res.send(member);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 매니저 리스트@
router.get('/:club_id/manager',async(req,res,next)=>{
    try{
        const manager = await Club_user.findAll({
            where:{cid:req.params.club_id,manager:true},
            include:[{
                model:User,
            }]
         });
         res.send(manager);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 추가@
router.post('/',uploader.single('image'),async(req,res,next)=>{
    try {
        var club;

        //동아리 생성
        if (req.file) {
            club = await Club.create({
                name: req.body.name,
                image: req.file.filename,
                campus: req.body.campus,
                certification: req.body.certification,
                type: req.body.type,
                classification: req.body.classification,
                member_count: 1,
                recruitment: req.body.recruitment,
            });
        } else {
            club = await Club.create({
                name: req.body.name,
                campus: req.body.campus,
                certification: req.body.certification,
                type: req.body.type,
                classification: req.body.classification,
                member_count: 1,
            });
        }

        await Club_user.create({
            uid: req.body.president_uid,
            cid: club.id,
            manager: true,
            nickname: req.body.name + ' 회장'
        })
        if (typeof req.body.hashtags != 'undefined') {
            var items = req.body.hashtags.split(',');
            for (var i = 0; i < items.length; i++)
                await Hashtag.create({ cid: club.id, hashtag: items[i] });
        }
        res.send(club);

    }catch(err){
        console.error(err);
        next(err);
    }
});

//관리자 설정 - 동아리 프로필 설정
router.patch('/profile/:club_id',uploader.single('image'),async(req,res,next)=>{
    try{
        var club;
        var htlist=[];
        if(typeof req.body.hashtags != 'undefined'){
            var items = req.body.hashtags.split(',');
            for(var i=0; i<items.length; i++)
                htlist.push(items[i]);
        }
        
        //해시태그 업데이트
        await Hashtag.destroy({
            where:{cid:req.params.club_id}
        });
        for(var i=0; i<htlist.length; i++){
            await Hashtag.create({
                cid:club.id,
                Hashtag:htlist[i]
            })
        }

        if(req.file){
            //이전 이미지 삭제
            const prevItem = await Club.findOne({id:req.params.club_id});
            fs.unlink(appDir + '/upload/' + prevItem.image, (err) => {
                console.log(err);
            });
            club = await Club.update({
                image: req.file.filename,
                text: req.body.text,
                nickname_rule: req.body.nickname_rule,
                membership_fee:req.body.membership_fee,
            },{
                where:{id:req.params.club_id}
            });
        }else{
            club = await Club.update({
                text: req.body.text,
                nickname_rule: req.body.nickname_rule,
                membership_fee:req.body.membership_fee,
            },{
                where:{id:req.params.club_id}
            });
        }
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 공개/비공개 전환@
router.patch('/exposure/:club_id',async(req,res,next)=>{
    try{
        const getClub = await Club.findOne({id:req.params.club_id})
        const bool = !getClub.exposure
        const club = await Club.update({
                exposure:bool
            },
            {
                where: {id:req.params.club_id}
            });
        res.send(updateRow(club))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 모집 상태 전환@
router.patch('/recruitment/:club_id',async(req,res,next)=>{
    try{
        const getClub = await Club.findOne({id:req.params.club_id})
        const bool = !getClub.recruitment
        const club = await Club.update({
                recruitment:bool
            },{
                where: {id:req.params.club_id}
            });
        res.send(updateRow(club))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 닉네임 변경@
router.patch('/:club_id/nickname/',async(req,res,next)=>{
    try{
        const exist = await Club_user.findOne({
            where:{cid:req.params.club_id,nickname:req.body.nickname}
        });
        if(exist!==null){
            console.log(exist);
            res.send(updateRow(0));
        }else{
            const result = await Club_user.update({
                nickname:req.body.nickname
            },{
                where:{cid:req.params.club_id,uid:req.body.uid}
            })
            res.send(updateRow(result));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN:매니저로 변경@
router.post('/manager/:club_id',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            manager:true,
        },{
            where:{cid:req.params.club_id,uid:req.body.uid}
        });
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 동아리 삭제@
router.delete('/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.findOne({
            where:{id:req.params.club_id}
        });
        if(!club){
            res.send(deleteRow(0));
        }else{
            fs.unlink(appDir+'/upload/'+club.image, (err) => {
                console.log(err);
            });
            const result = await Club.destroy({
                where:{id:req.params.club_id}
            });
            await Club_user.destroy({
                where:{cid:req.params.club_id}
            });
            res.send(deleteRow(result));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 동아리 회원 탈퇴,추방@
router.delete('/member/:club_id/:uid',async(req,res,next)=>{
    try{
        const result = await Club_user.destroy({
            where:{uid:req.params.uid, cid:req.params.club_id}
        })
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 매니저 해임 -> 일반멤버 변경@
router.delete('/manager/:club_id/:uid',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            manager:false
            }
            ,{
                where:{cid:req.params.club_id,uid:req.params.uid}
            })
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;