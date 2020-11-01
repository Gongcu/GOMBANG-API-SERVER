const express = require('express');
const deleteRow = require('../etc/deleteRow.js');
const updateRow = require('../etc/updateRow.js');
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
const { raw } = require('express');
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
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 특정 동아리 상세 정보@
router.get('/:clubId',async(req,res,next)=>{
    try{
        var club = await Club.findOne({
            raw:true
        });
        var hashtags = await Club_hashtag.sequelize.query(
                `SELECT ch.hashtagId, h.hashtag `+
                `FROM club_hashtags ch join hashtags h on ch.hashtagId=h.id WHERE ch.clubId=${req.params.clubId}`
        )
        club.hashtags=hashtags[0];
        res.send(club);
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
        for(var i=0; i<club.length; i++){
            var hashtags = await Club_hashtag.sequelize.query(
                `SELECT ch.hashtagId, h.hashtag `+
                `FROM club_hashtags ch join hashtags h on ch.hashtagId=h.id WHERE ch.clubId=${club[i].id}`
            )
            club[i].hashtags=hashtags[0];
        }
        res.send(club);
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
        res.send(post);
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
        res.send(member[0]);
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
         res.send(manager[0]);
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
            }, {transaction});
        } else {
            club = await Club.create({
                name: req.body.name,
                campus: req.body.campus,
                certification: req.body.certification,
                type: req.body.type,
                classification: req.body.classification,
                memberCount: 1,
            }, {transaction});
        }

        await Club_user.create({
            userId: req.body.presidentUserId,
            clubId: club.id,
            authority: '회장',
            nickname: req.body.name + ' 회장'
        },{transaction})

        if (typeof req.body.hashtags != 'undefined') {
            var items = req.body.hashtags.split(',');
            for (var i = 0; i < items.length; i++){
                const [hashtag,created] = await Hashtag.findOrCreate({
                    where:{hashtag:items[i]},transaction:transaction
                })
                await Club_hashtag.create({ clubId: club.id, hashtagId: hashtag.id },{transaction});
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

        if(req.file){
            //이전 이미지 삭제
            fs.unlink(appDir + '/upload/' + club.image, (err) => {
                console.log(err);
            });
            club.image = req.file.filename;
        }
        club.text = req.body.text;
        club.nicknameRule= req.body.nicknameRule;
        club.membershipFee=req.body.membershipFee;
        await club.save({transaction:transaction});

        //해시태그 업데이트
        await Club_hashtag.destroy({
            where:{clubId:req.params.clubId},transaction:transaction
        });

        if (typeof req.body.hashtags != 'undefined') {
            var items = req.body.hashtags.split(',');
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

        await transaction.commit();
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
        res.send(updateRow(result));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 모집 상태 전환@
router.patch('/:clubId/recruitment',async(req,res,next)=>{
    try{
        const club = await Club.findOne({id:req.params.clubId})
        club.recruitment = !(club.recruitment);
        await club.save();
        res.send(club.recruitment);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 피드 공개/비공개 전환@
router.patch('/:clubId/exposure/feed',async(req,res,next)=>{
    try{
        const club = await Club.findOne({id:req.params.clubId})
        club.feedExposure = !(club.feedExposure);
        await club.save();
        res.send(club.feedExposure);
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN: 공지사항 공개/비공개 전환@
router.patch('/:clubId/exposure/notice',async(req,res,next)=>{
    try{
        const club = await Club.findOne({id:req.params.clubId})
        club.noticeExposure = !(club.noticeExposure);
        await club.save();
        res.send(club.noticeExposure);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:부회장으로 변경@
router.post('/:clubId/vicepresident',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            authority:'부회장',
        },{
            where:{clubId:req.params.clubId,userId:req.body.userId}
        });
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:매니저로 변경@
router.post('/:clubId/manager',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            authority:'관리자',
        },{
            where:{clubId:req.params.clubId,userId:req.body.userId}
        });
        res.send(updateRow(result));
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
            res.send(deleteRow(0));
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
            res.send(deleteRow(result));
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
            where:{userId:req.params.userId, clubId:req.params.clubId}
        });
        const club = await Club.findOne({where:{id:req.params.clubId}});
        club.memberCount -=1;
        await club.save({transaction:transaction});
        await transaction.commit();
        res.send(updateRow(result));
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});


//POSTMAN: 매니저,부회장,회장 해임 -> 일반멤버 변경@
router.delete('/:clubId/manager/:userId',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            authority:'멤버'
            }
            ,{
                where:{clubId:req.params.clubId,userId:req.params.userId}
            })
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;