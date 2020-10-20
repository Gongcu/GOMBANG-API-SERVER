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
                `SELECT ch.hid, h.hashtag `+
                `FROM club_hashtag ch join hashtags h on ch.hid=h.id WHERE ch.club_id=${club[i].id}`
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
router.get('/:club_id',async(req,res,next)=>{
    try{
        var club = await Club.findOne({
            raw:true
        });

        var hashtags = await Club_hashtag.sequelize.query(
                `SELECT ch.hid, h.hashtag `+
                `FROM club_hashtag ch join hashtags h on ch.hid=h.id WHERE ch.club_id=${req.params.club_id}`
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
                `SELECT ch.hid, h.hashtag `+
                `FROM club_hashtag ch join hashtags h on ch.hid=h.id WHERE ch.club_id=${club[i].id}`
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
router.get('/:club_id/:uid/mypost/',async(req,res,next)=>{
    try{
        const post = await Post.findAll({
            where:{uid:req.params.uid, club_id:req.params.club_id}
        });
        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 동아리 회원 리스트@
router.get('/:club_id/member',async(req,res,next)=>{
    try{
        const member = await Club_user.sequelize.query(
            `SELECT c.uid, u.name, u.image, u.student_number, c.nickname, c.authority `+
            `FROM club_user c join users u on c.uid=u.id WHERE c.club_id=${req.params.club_id}`
        )
        res.send(member[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 관리자 리스트@
router.get('/:club_id/manager',async(req,res,next)=>{
    try{
        const manager = await Club_user.sequelize.query(
            `SELECT c.uid, u.name, u.image, u.student_number, c.nickname, c.authority `+
            `FROM club_user c join users u on c.uid=u.id WHERE c.club_id=${req.params.club_id} AND c.authority NOT LIKE '멤버' `
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
                member_count: 1,
                recruitment: req.body.recruitment,
            }, {transaction});
        } else {
            club = await Club.create({
                name: req.body.name,
                campus: req.body.campus,
                certification: req.body.certification,
                type: req.body.type,
                classification: req.body.classification,
                member_count: 1,
            }, {transaction});
        }

        await Club_user.create({
            uid: req.body.president_uid,
            club_id: club.id,
            authority: '회장',
            nickname: req.body.name + ' 회장'
        },{transaction})

        if (typeof req.body.hashtags != 'undefined') {
            var items = req.body.hashtags.split(',');
            for (var i = 0; i < items.length; i++){
                const [hashtag,created] = await Hashtag.findOrCreate({
                    where:{hashtag:items[i]},transaction:transaction
                })
                await Club_hashtag.create({ club_id: club.id, hid: hashtag.id },{transaction});
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
router.patch('/profile/:club_id',uploader.single('image'),async(req,res,next)=>{
    let transaction;
    try{
        var club;
        transaction = await Club.sequelize.transaction()

        //해시태그 업데이트
        await Hashtag.destroy({
            where:{club_id:req.params.club_id}
        });

        if(typeof req.body.hashtags != 'undefined'){
            var items = req.body.hashtags.split(',');
            for(var i=0; i<items.length; i++)
                await Hashtag.create({ club_id: club.id, hashtag: items[i] },{transaction});
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
                where:{id:req.params.club_id},transaction:transaction
            });
        }else{
            club = await Club.update({
                text: req.body.text,
                nickname_rule: req.body.nickname_rule,
                membership_fee:req.body.membership_fee,
            },{
                where:{id:req.params.club_id},transaction:transaction
            });
        }
        await transaction.commit();
        res.status(200).send(club);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 닉네임 변경@
router.patch('/:club_id/nickname/', async (req, res, next) => {
    try {
        const result = await Club_user.update({
            nickname: req.body.nickname
        }, {
            where: { club_id: req.params.club_id, uid: req.body.uid }
        })
        res.send(updateRow(result));
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 모집 상태 전환@
router.patch('/recruitment/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.findOne({id:req.params.club_id})
        club.recruitment = !(club.recruitment);
        await club.save();
        res.send(club.recruitment);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 피드 공개/비공개 전환@
router.patch('/exposure/feed/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.findOne({id:req.params.club_id})
        club.feed_exposure = !(club.feed_exposure);
        await club.save();
        res.send(club.feed_exposure);
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN: 공지사항 공개/비공개 전환@
router.patch('/exposure/notice/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.findOne({id:req.params.club_id})
        club.notice_exposure = !(club.notice_exposure);
        await club.save();
        res.send(club.notice_exposure);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:부회장으로 변경@
router.post('/vicepresident/:club_id',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            authority:'부회장',
        },{
            where:{club_id:req.params.club_id,uid:req.body.uid}
        });
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:매니저로 변경@
router.post('/manager/:club_id',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            authority:'관리자',
        },{
            where:{club_id:req.params.club_id,uid:req.body.uid}
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
                where:{club_id:req.params.club_id}
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
            where:{uid:req.params.uid, club_id:req.params.club_id}
        })
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 매니저,부회장,회장 해임 -> 일반멤버 변경@
router.delete('/manager/:club_id/:uid',async(req,res,next)=>{
    try{
        const result = await Club_user.update({
            authority:'멤버'
            }
            ,{
                where:{club_id:req.params.club_id,uid:req.params.uid}
            })
        res.send(updateRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;