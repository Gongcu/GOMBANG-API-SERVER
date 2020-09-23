const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/user');
const formatWriteResult = require('../etc/formatWriteResult.js');
const formatDeleteResult = require('../etc/formatDeleteResult.js');
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

router.use(bodyParser.json());

router.get('/',async(req,res,next)=>{
    try{
        const user = await User.find({});
        if(user.length===0){
            res.send('empty');
        }else{
            res.send(user);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:kakaoId',async(req,res,next)=>{
    try{
        const user = await User.findOne({kakaoId:req.params.kakaoId}).populate('signed_club_list','name image').populate('favorite_club_list','name image');
        if(user.length===0){
            res.send('empty');
        }else{
            res.send(user);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN
router.post('/',uploader.single('image'),async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        var user;
        if(req.file){
            user = await User.create({
                name: body.name,
                image: req.file.filename,
                email: body.email,
                token: body.token,
                kakaoId: body.kakaoId,
                birth: body.birth,
                phone: body.phone,
                login: body.login,
                college: body.college,
                department: body.department,
                student_number: body.student_number,
                nickname: body.nickname,
                signed_club_list: body.signed_club_list,
                favorite_club_list: body.favorite_club_list
            });
        } else {
            user = await User.create({
                name: body.name,
                email: body.email,
                token: body.token,
                kakaoId: body.kakaoId,
                birth: body.birth,
                phone: body.phone,
                login: body.login,
                college: body.college,
                department: body.department,
                student_number: body.student_number,
                nickname: body.nickname,
                signed_club_list: body.signed_club_list,
                favorite_club_list: body.favorite_club_list
            });
        }
        if(user.length===0){
            res.send('user create failed')
        }else{
            res.send(user);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});


router.post('/favorite_club_list/:uid',async(req,res,next)=>{
    try{
        const user = await User.updateOne({_id:req.params.uid},{$push:{favorite_club_list:req.body.cid}})
        if(user.length===0){
            res.send('user create failed')
        }else{
            res.send(formatWriteResult(user));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:uid',async(req,res,next)=>{
    try{
        const user = await User.remove({_id:req.params.uid});
        if(user.image){
            fs.unlink(appDir+'/upload/'+user.image, (err) => {
                console.log(err);
            });
        }
        res.send(formatDeleteResult(user));
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/favorite_club_list/:uid/:cid',async(req,res,next)=>{
    try{
        const user = await User.updateOne({_id:req.params.uid},{$pull:{favorite_club_list:req.params.cid}});
        if(user===null){
            res.send('cannot delete the club');
        }else{
            res.send(formatWriteResult(user));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;