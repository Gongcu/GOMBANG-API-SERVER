const express = require('express');
const Club = require('../schemas/club');
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
        const club = await Club.find({});
        if(club.length===0){
            res.send('empty');
        }else{
            res.send(club);
        }
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:name',async(req,res,next)=>{
    try{
        const club = await Club.find({name:req.params.name});
        if(club.length===0){
            res.send('empty');
        }else{
            res.send(club);
        }
        //const result = await Club.populate(club, {path:'member_uid_list'});
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

router.delete('/:name',async(req,res,next)=>{
    try{
        const obj = await Club.findOne({name:req.params.name});
        const club = await Club.remove({name:req.params.name});
        const filename = obj.image;
        fs.unlink(appDir+'/upload/'+filename, (err) => {
            console.log(err);
        });
        res.send(club);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});
module.exports = router;