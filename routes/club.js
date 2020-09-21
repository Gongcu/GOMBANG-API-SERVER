const express = require('express');
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const formatWriteResult = require('../etc/formatWriteResult.js');
const Club = require('../schemas/club');
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
router.get('/:cid',async(req,res,next)=>{
    try{
        const club = await Club.findOne({_id:req.params.cid});//.populate('member_uid_list')//.populate('manager_uid_list');
        if(club===null){
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
router.get('/:id/member',async(req,res,next)=>{
    try{
        const club = await Club.findOne({_id:req.params.id}).populate('member_uid_list');
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
router.get('/:id/manager',async(req,res,next)=>{
    try{
        const club = await Club.findOne({_id:req.params.id}).populate('manager_uid_list');
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

router.post('/',uploader.single('image'),async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        var club;
        if(req.file){
            club = await Club.create({
                name: body.name,
                image: req.file.filename,
                campus: body.campus,
                text: body.text,
                president_uid: body.president_uid,
                member_uid_list: body.member_uid_list,
                certification: body.certification,
                type:body.type,
                classification:body.classification,
                membership_fee:body.membership_fee,
                member_count:body.member_count,
                member_uid_list:body.member_uid_list,
                recruitment:body.recruitment,
                hashtags:body.hashtags
            });
        }else{
            club = await Club.create({
                name: body.name,
                campus: body.campus,
                text: body.text,
                president_uid: body.president_uid,
                member_uid_list: body.member_uid_list,
                certification: body.certification,
                type:body.type,
                classification:body.classification,
                membership_fee:body.membership_fee,
                member_count:body.member_count,
                member_uid_list:body.member_uid_list,
                recruitment:body.recruitment,
                hashtags:body.hashtags
            });
        }
        
        if(club.length===0){
            res.send('club create failed')
        }else{
            res.send(club);
        }
        //const result = await Club.populate(club, {path:'member_uid_list'});
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
router.post('/member/:cid',async(req,res,next)=>{
    try{
        const club = await Club.updateOne({_id:req.params.cid},{$push:{member_uid_list:req.body.uid}});
        const user = await User.updateOne({_id:req.body.uid},{$push:{signed_club_list:req.params.cid}});
        if(formatWriteResult(club)===false && formatWriteResult(user)===false){
            res.send('club create failed')
        }else{
            res.send(true);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.post('/manager/:cid',async(req,res,next)=>{
    try{
        const club = await Club.updateOne({_id:req.params.cid},{$push:{manager_uid_list:req.body.uid}});
        if(formatWriteResult(club)===false){
            res.send('club create failed')
        }else{
            res.send(true);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});



router.delete('/:id',async(req,res,next)=>{
    try{
        const club = await Club.remove({_id:req.params.id});
        fs.unlink(appDir+'/upload/'+club.image, (err) => {
            console.log(err);
        });
        res.send(club);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//REST API 설계 규약을 따름 (Request Body는 지양)
//POSTMAN
router.delete('/member/:cid/:uid',async(req,res,next)=>{
    try{
        const user = await User.updateOne({_id:req.params.uid},{$pull:{signed_club_list:req.params.cid}});
        const club = await Club.updateOne({_id:req.params.cid},{$pull:{member_uid_list:req.params.uid}});
        if(formatWriteResult(club)===false && formatWriteResult(user)===false){
            res.send('cannot delete the member');
        }else{
            res.send(true);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.delete('/manager/:cid/:uid',async(req,res,next)=>{
    try{
        const club = await Club.updateOne({_id:req.params.cid},{$pull:{manager_uid_list:req.params.uid}});
        if(formatWriteResult(club)===false){
            res.send('cannot delete the manager');
        }else{
            res.send(true);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;