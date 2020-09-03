const express = require('express');
const router = express.Router();
const Event = require('../schemas/event');
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


router.get('/',async(req,res,next)=>{
    try{
        const event = await Event.find({});
        if(event.length===0){
            res.send('empty');
        }else{
            res.send(event);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id',async(req,res,next)=>{
    try{
        const event = await Event.find({_id:req.params.id});
        if(event.length===0){
            res.send('empty');
        }else{
            res.send(event);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/',uploader.fields([{name:'banner'},{name:'image'}]),async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        var event;
        if(typeof req.files['image']=='undefined' && typeof req.files['banner']=='undefined'){//이미지, 배너 둘 다 없는 경우
            res.send('banner is required');
        }
        else if(typeof req.files['banner']!='undefined' && typeof req.files['image']=='undefined'){//배너만 존재하고 이미지는 없을 경우.
            event = await Event.create({
                host_id: body.host_id,
                host_club_id:body.host_club_id,
                text:body.text,
                banner: req.files['banner'][0].filename,
                like_count: body.like_count,
                liker_id_list: body.liker_id_list,
                participation_fee: body.participation_fee,
                participation_count: body.participation_count,
                participation_id_list:body.participation_id_list,
                paid_id_list:body.paid_id_list,
                comment_count:body.comment_count,
                comment_id_list:body.comment_id_list,
                event_title:body.event_title,
                event_start_day:body.event_start_day,
                event_end_day:body.event_end_day,
                event_place:body.event_place,
                event_memo:body.event_memo
            });
        }
        else{//둘 다 존재할 경우
            event = await Event.create({
                host_id: body.host_id,
                host_club_id:body.host_club_id,
                text:body.text,
                banner: req.files['banner'][0].filename,
                image: req.files['image'][0].filename,
                like_count: body.like_count,
                liker_id_list: body.liker_id_list,
                participation_fee: body.participation_fee,
                participation_count: body.participation_count,
                participation_id_list:body.participation_id_list,
                paid_id_list:body.paid_id_list,
                comment_count:body.comment_count,
                comment_id_list:body.comment_id_list,
                event_title:body.event_title,
                event_start_day:body.event_start_day,
                event_end_day:body.event_end_day,
                event_place:body.event_place,
                event_memo:body.event_memo
            });
        }
        
        if(event.length===0){
            res.send('event create failed')
        }else{
            res.send(event);
        }
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id',async(req,res,next)=>{
    try{
        const event = await Event.remove({_id:req.params.id});
        fs.unlink(appDir+'/upload/'+event.banner, (err) => {
            console.log(err);
        });
        if (event.image) {
            fs.unlink(appDir + '/upload/' + event.image, (err) => {
                console.log(err);
            });
        }
        res.send(event);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;