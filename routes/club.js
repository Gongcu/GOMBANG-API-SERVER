const express = require('express');
const deleteRow = require('../etc/deleteRow.js');
const updateRow = require('../etc/updateRow.js');
const Post = require('../models/post');
const Club = require('../models/club');
const Club_user = require('../models/club_user');
const Club_hashtag= require('../models/club_hashtag');
const Hashtag= require('../models/hashtag');
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

//POSTMAN 검색탭의 동아리 리스트@
router.get('/',async(req,res,next)=>{
    try{
        var club = await Club.findAll({
            raw:true
        });
        for(var i=0; i<club.length; i++){
            var hashtags = await Club_hashtag.sequelize.query(
                `SELECT ch.hashtagId, h.hashtag `+
                `FROM club_hashtags ch join hashtags h on ch.hashtagId=h.id WHERE ch.clubId=${club[i].id}`
            )
            club[i].hashtags=hashtags[0];
        }
        if(club.length)
            res.status(200).send(club);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 특정 동아리 상세 정보@
router.get('/:clubId',async(req,res,next)=>{
    try{
        var club = await Club.findOne({
            where:{id:req.params.clubId},
            raw:true
        });
        if(club){
            var hashtags = await Club_hashtag.sequelize.query(
                `SELECT ch.hashtagId, h.hashtag `+
                `FROM club_hashtags ch join hashtags h on ch.hashtagId=h.id WHERE ch.clubId=${req.params.clubId}`
            )
            club.hashtags=hashtags[0];
            res.status(200).send(club);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 캠퍼스별 동아리 리스트@
router.get('/campus/:campus',async(req,res,next)=>{
    try{
        var club = await Club.findAll({
            where:{campus:req.params.campus},
            raw:true
        });
        if(club.length){
            for(var i=0; i<club.length; i++){
                var hashtags = await Club_hashtag.sequelize.query(
                    `SELECT ch.hashtagId, h.hashtag `+
                    `FROM club_hashtags ch join hashtags h on ch.hashtagId=h.id WHERE ch.clubId=${club[i].id}`
                )
                club[i].hashtags=hashtags[0];
            }
            res.status(200).send(club);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN: 동아리 내 작성글@
router.get('/:clubId/:userId/mypost/',async(req,res,next)=>{
    try{
        const post = await Post.findAll({
            where:{userId:req.params.userId, clubId:req.params.clubId}
        });
        if(post.length)
            res.status(200).send(post);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 동아리 회원 리스트@
router.get('/:clubId/member',async(req,res,next)=>{
    try{
        const member = await Club_user.sequelize.query(
            `SELECT c.userId, u.name, u.image, u.studentNumber, c.nickname, c.authority `+
            `FROM club_users c join users u on c.userId=u.id WHERE c.clubId=${req.params.clubId}`
        )
        if(member[0].length){
            res.status(200).send(member[0]);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 관리자 리스트@
router.get('/:clubId/manager',async(req,res,next)=>{
    try{
        const manager = await Club_user.sequelize.query(
            `SELECT c.userId, u.name, u.image, u.studentNumber, c.nickname, c.authority `+
            `FROM club_users c join users u on c.userId=u.id WHERE c.clubId=${req.params.clubId} AND c.authority NOT LIKE '멤버' `
        )
        if(manager[0].length){
            res.status(200).send(manager[0]);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 추가@
router.post('/',uploader.single('image'),async(req,res,next)=>{
    let transaction;
    try {
        transaction = await Club.sequelize.transaction()
        var club;
        if (req.file) {
            club = await Club.create({
                name: req.body.name,
                image: req.file.filename,
                campus: req.body.campus,
                certification: req.body.certification,
                type: req.body.type,
                classification: req.body.classification,
                memberCount: 1,
            },{transaction:transaction});
        } else {
            club = await Club.create({
                name: req.body.name,
                campus: req.body.campus,
                certification: req.body.certification,
                type: req.body.type,
                classification: req.body.classification,
                memberCount: 1,
            }, {transaction:transaction});
        }

        await Club_user.create({
            userId: req.body.presidentUserId,
            clubId: club.id,
            authority: '회장',
            nickname: req.body.name + ' 회장'
        }, {transaction:transaction});

        if (typeof req.body.hashtags != 'undefined') {
            var items = req.body.hashtags.split(',');
            items = Array.from(new Set(items));//인풋 중복 해시태그 제거
            for (var i = 0; i < items.length; i++){
                const [hashtag,created] = await Hashtag.findOrCreate({
                    where:{hashtag:items[i]},transaction:transaction
                })
                await Club_hashtag.create({ clubId: club.id, hashtagId: hashtag.id }, {transaction:transaction});
            }    
        }
        await transaction.commit();
        res.status(200).send(club);
    }catch(err){
        if (transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//관리자 설정 - 동아리 프로필 설정
router.patch('/:clubId/profile',uploader.single('image'),async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Club.sequelize.transaction()
        var club = await Club.findOne({where:{id:req.params.clubId},transaction:transaction});
        let prevImageFile = club.image;

        if(req.file)
            club.image = req.file.filename;
        else
            club.image = "";
        
        club.text = req.body.text;
        club.nicknameRule= req.body.nicknameRule;
        club.membershipFee=req.body.membershipFee;
        await club.save({transaction:transaction});

        //해시태그 업데이트(기존 해시태그 삭제 -> 새 해시태그 추가)
        await Club_hashtag.destroy({
            where:{clubId:req.params.clubId},transaction:transaction
        });

        if (typeof req.body.hashtags != 'undefined') {
            var items = req.body.hashtags.split(',');
            items = Array.from(new Set(items));//인풋 중복 해시태그 제거
            for (var i = 0; i < items.length; i++){
                const [hashtag,created] = await Hashtag.findOrCreate({
                    where:{hashtag:items[i]},transaction:transaction
                })
                await Club_hashtag.create({ clubId: club.id, hashtagId: hashtag.id },{transaction});
            }    
        }
        club = await Club.findOne({where:{id:req.params.clubId},transaction:transaction,raw:true});
        const hashtags = await Club_hashtag.sequelize.query(
            `SELECT ch.hashtagId, h.hashtag `+
            `FROM club_hashtags ch join hashtags h on ch.hashtagId=h.id WHERE ch.clubId=${club.id}`,{transaction:transaction}
        );
        club.hashtags=hashtags[0];

        await transaction.commit().then(()=>{
            if(prevImageFile!="")
                fs.unlink(appDir + '/upload/' + club.image, (err) => {
                    console.log(err);
                });
        });
        res.status(200).send(club);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 닉네임 변경@
router.patch('/:clubId/nickname', async (req, res, next) => {
    try {
        const result = await Club_user.update({
            nickname: req.body.nickname
        }, {
            where: { clubId: req.params.clubId, userId: req.body.userId }
        })
        if(updateRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 모집 상태 전환@
router.patch('/:clubId/recruitment',async(req,res,next)=>{
    try{
        const club = await Club.findOne({where:{id:req.params.clubId}});
        if(club){
            club.recruitment = !(club.recruitment);
            await club.save();
            res.status(200).send(club.recruitment);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 피드 공개/비공개 전환@
router.patch('/:clubId/exposure/feed',async(req,res,next)=>{
    try{
        const club = await Club.findOne({where:{id:req.params.clubId}});
        if(club){
            club.feedExposure = !(club.feedExposure);
            await club.save();
            res.status(200).send(club.feedExposure);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN: 공지사항 공개/비공개 전환@
router.patch('/:clubId/exposure/notice',async(req,res,next)=>{
    try{
        const club = await Club.findOne({where:{id:req.params.clubId}});
        if(club){
            club.noticeExposure = !(club.noticeExposure);
            await club.save();
            res.status(200).send(club.noticeExposure);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:부회장으로 변경@
router.patch('/:clubId/vicepresident',async(req,res,next)=>{
    try{
        const user = await Club_user.findOne({where:{clubId:req.params.clubId,userId:req.body.userId}});
        if(user){
            user.authority ='부회장';
            await user.save();
            res.status(200).send(true);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:관리자로 변경@
router.patch('/:clubId/manager',async(req,res,next)=>{
    try{
        const user = await Club_user.findOne({where:{clubId:req.params.clubId,userId:req.body.userId}});
        if(user){
            user.authority ='관리자';
            await user.save();
            res.status(200).send(true);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:멤버로 변경@
router.patch('/:clubId/member',async(req,res,next)=>{
    try{
        const user = await Club_user.findOne({where:{clubId:req.params.clubId,userId:req.body.userId}});
        if(user){
            user.authority ='멤버';
            await user.save();
            res.status(200).send(true);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 삭제@
router.delete('/:clubId',async(req,res,next)=>{
    try{
        const club = await Club.findOne({
            where:{id:req.params.clubId}
        });
        if(!club){
            res.status(204).send();
        }else{
            fs.unlink(appDir+'/upload/'+club.image, (err) => {
                console.log(err);
            });
            const result = await Club.destroy({
                where:{id:req.params.clubId}
            });
            await Club_user.destroy({
                where:{clubId:req.params.clubId}
            });
            res.status(200).send(deleteRow(result));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 동아리 회원 탈퇴,추방@
router.delete('/:clubId/:userId',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Club_user.sequelize.transaction();
        const result = await Club_user.destroy({
            where:{userId:req.params.userId, clubId:req.params.clubId},transaction:transaction
        });
        const club = await Club.findOne({where:{id:req.params.clubId},transaction:transaction});
        club.memberCount -=1;
        await club.save({transaction:transaction});
        await transaction.commit();
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