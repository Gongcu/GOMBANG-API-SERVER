const express = require('express');
const formatWriteResult = require('../etc/formatWriteResult.js');
const Club = require('../schemas/club');
const Post = require('../schemas/post');
const User = require('../schemas/user');
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
const { send } = require('process');
const formatDeleteResult = require('../etc/formatDeleteResult.js');
var appDir = path.dirname(require.main.filename);

const router = express.Router();

//POSTMAN
router.get('/',async(req,res,next)=>{
    try{
        const club = await Club.find({});
        if(club.length===0){
            res.send('empty');
        }else{
            res.send(club);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.findOne({_id:req.params.club_id});//.populate('member_uid_list')//.populate('manager_uid_list');
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/:club_id/:uid/mypost/',async(req,res,next)=>{
    try{
        const post = await Post.find({club_id:req.params.club_id,writer_uid:req.params.uid});//.populate('member_uid_list')//.populate('manager_uid_list');
        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 닉네임 사용가능 여부
router.get('/:cid/nickname/:nickname',async(req,res,next)=>{
    try{
        var result = await Club.findOne(
            {_id:req.params.cid,used_nickname_list:{$elemMatch: {nickname: req.params.nickname}}});
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





//POSTMAN
router.get('/:club_id/member',async(req,res,next)=>{
    try{
        const club = await Club.findOne({_id:req.params.club_id}).populate('member_uid_list');
        if(club.length===0){
            res.send('empty');
        }else{
            res.send(club.member_uid_list);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/:club_id/manager',async(req,res,next)=>{
    try{
        const club = await Club.findOne({_id:req.params.club_id}).populate('manager_uid_list');
        if(club.length===0){
            res.send('empty');
        }else{
            res.send(club.manager_uid_list);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.post('/',uploader.single('image'),async(req,res,next)=>{
    try{
        var club;

        const presidentNickname = {
            uid:req.body.president_uid,
            name:req.body.name+' 회장'
        }
        var htlist=[];
        if(typeof req.body.hashtags != 'undefined'){
            var items = req.body.hashtags.split(',');
            for(var i=0; i<items.length; i++)
                htlist.push(items[i]);
        }

        
        if(req.file){
            club = await Club.create({
                name: req.body.name,
                image: req.file.filename,
                campus: req.body.campus,
                president_uid: req.body.president_uid,
                member_uid_list: [req.body.president_uid],
                certification: req.body.certification,
                type:req.body.type,
                classification:req.body.classification,
                member_count:1,
                manager_uid_list:[req.body.president_uid],
                used_nickname_list:[presidentNickname],
                recruitment:req.body.recruitment,
                hashtags:htlist
            });
        }else{
            club = await Club.create({
                name: req.body.name,
                campus: req.body.campus,
                president_uid: req.body.president_uid,
                member_uid_list: [req.body.president_uid],
                certification: req.body.certification,
                type:req.body.type,
                classification:req.body.classification,
                member_count:1,
                manager_uid_list:[req.body.president_uid],
                used_nickname_list:[presidentNickname],
                hashtags:htlist
            });
        }
        
        if(club.length===0){
            res.send('club create failed')
        }else{
            const user = await User.updateOne({_id:req.body.president_uid}, {$push:{signed_club_list:club._id}});
            res.send(club);
        }
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
            
        if(req.file){
            //이전 이미지 삭제
            const prevItem = await Club.findOne({_id:req.params.club_id});
            fs.unlink(appDir + '/upload/' + prevItem.image, (err) => {
                console.log(err);
            });

            club = await Club.updateOne({_id:req.params.club_id},{$set:{
                image: req.file.filename,
                text: req.body.text,
                nickname_rule: req.body.nickname_rule,
                membership_fee:req.body.membership_fee,
                hashtags:htlist
            }});
        }else{
            club = await Club.updateOne({_id:req.params.club_id},{$set:{
                text: req.body.text,
                nickname_rule: req.body.nickname_rule,
                membership_fee:req.body.membership_fee,
                hashtags:htlist
            }});
        }
        res.send(formatWriteResult(club));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/exposure/:cid',async(req,res,next)=>{
    try{
        const getClub = await Club.findOne({_id:req.params.cid},{_id:0,exposure:1})
        const club = await Club.updateOne({_id:req.params.cid},{$set:{exposure:getClub.exposure}});
        if(formatWriteResult(club)===false){
            res.send('update failed')
        }else{
            res.send(true);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/recruitment/:cid',async(req,res,next)=>{
    try{
        const getClub = await Club.findOne({_id:req.params.cid},{_id:0,recruitment:1})
        const club = await Club.updateOne({_id:req.params.cid},{$set:{recruitment:getClub.recruitment}});
        if(club.length===0){
            res.send('update failed')
        }else{
            res.send(formatWriteResult(club));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/:cid/nickname/',async(req,res,next)=>{
    try{
        const exist = await Club.findOne({_id:req.params.cid,"used_nickname_list.nickname":req.body.nickname});
        if(exist!==null){
            console.log(exist);
            res.send(false);
        }else{
            //특정 동아리의 사용중 닉네임리스트에서 해당하는 uid를 찾아 --> 닉네임을 바꾼다.
            var result = await Club.updateOne(
                {_id:req.params.cid,used_nickname_list:{$elemMatch: {uid: req.body.uid}}},
                 {$set:{"used_nickname_list.$.nickname":req.body.nickname}});
            res.send(formatWriteResult(result));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN
router.post('/manager/:club_id',async(req,res,next)=>{
    try{
        const exist = await Club.findOne({_id:req.params.club_id,manager_uid_list:req.body.uid});
        if(exist){
            res.send(false);
        }else{
            const club = await Club.updateOne({_id:req.params.club_id},{$push:{manager_uid_list:req.body.uid}});
            res.send(formatWriteResult(club));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN
router.delete('/:club_id',async(req,res,next)=>{
    try{
        const club = await Club.remove({_id:req.params.club_id});
        fs.unlink(appDir+'/upload/'+club.image, (err) => {
            console.log(err);
        });
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.delete('/:club_id/nickname/:nickname',async(req,res,next)=>{
    try{
        const user = await Club.updateOne({_id:req.params.club_id},{$pull:{used_nickname_list:{nickname:req.params.nickname}}});
        res.send(formatWriteResult(user));
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN
router.delete('/member/:club_id/:uid',async(req,res,next)=>{
    try{
        const user = await User.updateOne({_id:req.params.uid},{$pull:{signed_club_list:req.params.club_id}});
        const result = await Club.updateOne({_id:req.params.club_id}, {$pull:{used_nickname_list:{uid:req.params.uid}, member_uid_list:req.params.uid}});
        res.send(formatWriteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN
router.delete('/manager/:club_id/:uid',async(req,res,next)=>{
    try{
        const club = await Club.updateOne({_id:req.params.club_id},{$pull:{manager_uid_list:req.params.uid}});
        res.send(formatWriteResult(club));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;