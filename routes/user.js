const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
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
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id',async(req,res,next)=>{
    try{
        const user = await User.remove({_id:req.params.id});
        if(user.image){
            fs.unlink(appDir+'/upload/'+user.image, (err) => {
                console.log(err);
            });
        }
        res.send(user);
        //const result = await Club.populate(club, {path:'member_uid_list'});
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;