const express = require('express');
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

const router = express.Router();

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


router.get('/image/:filename',async(req,res)=>{
    fs.readFile(appDir+'/upload/'+req.params.filename, (err, data)=>{
        if(err){
            throw err;
        }
        res.writeHead(200, {'Content-Type':'image/png'})
        res.write(data);
        res.end();
    });
});
/*
* TO-DO
router.post('/',uploader.single('image'),async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        const club = await Club.create({
            name: body.name,
            image: req.file.filename,
            campus: body.campus,
            president_uid: body.president_uid,
            member_uid_list: body.member_uid_list,
            certification: body.certification,
            type:body.type,
            classification:body.classification,
            membership_fee:body.membership_fee,
            member_count:body.member_count,
            member_uid_list:body.member_uid_list,
            recruitment:body.recruitment
        });
        res.send(club);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});
*/
router.delete('/:id',async(req,res,next)=>{
    try{
        const obj = await Event.findOne({_id:req.params.id});
        const event = await Event.remove({_id:req.params.id});
        const filename = obj.image;
        fs.unlink(appDir+'/upload/'+filename, (err) => {
            console.log(err);
        });
        res.send(event);
    }catch(err){
        console.error(err);
        next(err);
    }
});
module.exports = router;