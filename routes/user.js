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

//POSTMAN
router.get('/:_id',async(req,res,next)=>{
    try{
        var user = await User.findOne({kakaoId:req.params._id}).populate('signed_club_list','name image').populate('favorite_club_list','name image');
        if(user === null){
            user = await User.findOne({_id:req.params._id}).populate('signed_club_list','name image').populate('favorite_club_list','name image');
        }
        res.send(user);
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN
router.post('/',uploader.single('image'),async(req,res,next)=>{
    try{
        var user;
        if(req.file){
            user = await User.create({
                name: req.body.name,
                image: req.file.filename,
                email: req.body.email,
                token: req.body.token,
                kakaoId: req.body.kakaoId,
                birth: req.body.birth,
                phone: req.body.phone,
                campus: req.body.campus,
                college: req.body.college,
                department: req.body.department,
                student_number: req.body.student_number,
            });
        } else {
            user = await User.create({
                name: req.body.name,
                email: req.body.email,
                token: req.body.token,
                kakaoId: req.body.kakaoId,
                birth: req.body.birth,
                phone: req.body.phone,
                campus: req.body.campus,
                college: req.body.college,
                department: req.body.department,
                student_number: req.body.student_number,
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

//POSTMAN
router.patch('/profile/:uid',uploader.single('image'),async(req,res,next)=>{
    try{
        if(req.file){
            const user = await User.findOneAndUpdate({_id:req.params.uid},{$set:{image:req.file.filename}});
            //이전 이미지 제거
            if(user.image !== "")
                fs.unlink(appDir + '/upload/' + user.image, (err) => {
                    console.log(err);
                });
            res.send(formatWriteResult(user));
        }else{
            res.send(false);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/favorite_club_list/:uid',async(req,res,next)=>{
    try{
        var result;
        const user = await User.findOne({_id:req.params.uid});
        if(user.length!==0){
            const exist=user.favorite_club_list.indexOf(req.body.cid);
            if(exist!==-1)
                result = await User.updateOne({_id:req.params.uid},{$pull:{favorite_club_list:req.body.cid}});
            else
                result = await User.updateOne({_id:req.params.uid},{$push:{favorite_club_list:req.body.cid}});
        }
        res.send(formatWriteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.patch('/favorite_club_list/order/:uid',async(req,res,next)=>{
    try{
        var list = req.body.favorite_club_list;
        const result = await User.updateOne({_id:req.params.uid},{$set:{favorite_club_list:list}});
        
        res.send(formatWriteResult(result));
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


module.exports = router;