const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user');
const Club = require('../models/club');
const User_favorite_club = require('../models/user_favorite_club');
const {Op} = require('sequelize');
const updateRow = require('../etc/updateRow')
const deleteRow = require('../etc/deleteRow')
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
        const user = await User.findAll({});
        res.send(user);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/:id',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{
                [Op.or]:[{kakaoId:req.params.id},{id:req.params.id}],
            },
        });
        res.send(user);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 추가/삭제
router.get('/favorite_club_list/:uid',async(req,res,next)=>{
    try{
        const list = await User_favorite_club.findAll({
            where:{uid:req.params.uid},
            include:[{
                model:Club
            }],
            order:[['itemOrder','ASC']]
        });
        res.send(list);
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN: 유저 추가@
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
        res.send(user);
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN: 프로필 이미지 변경@
router.patch('/profile/:uid',uploader.single('image'),async(req,res,next)=>{
    try{
        if(req.file){
            const prevUserProfile = await User.findOne({
                where:{id:req.params.uid}
            });
            if(prevUserProfile.image !== "")
                fs.unlink(appDir + '/upload/' + prevUserProfile.image, (err) => {
                    console.log(err);
                });
            const user = await User.update({
                image:req.file.filename
            },{
                where:{id:req.params.uid}
            });
            res.send(updateRow(user));
        }else{
            res.send(false);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 추가/삭제
router.patch('/favorite_club_list/:uid',async(req,res,next)=>{
    try{
        const exist = await User_favorite_club.findOne({
            where:{uid:req.params.uid,club_id:req.body.club_id}
        });
        if(!exist){//존재하지 않음:추가
            const maxOrderedItem = await User_favorite_club.findOne({
                where:{uid:req.params.uid},
                order:[['itemOrder','DESC']],
            })
            let maxOrder = maxOrderedItem.itemOrder+1;
            console.log(maxOrder);
            if(maxOrder===null){
                maxOrder=0;
            }
            console.log(maxOrder);

            const result1 = await User_favorite_club.create({
                uid:req.params.uid,
                club_id:req.body.club_id,
                itemOrder:maxOrder
            })
            if(result1)
                res.send(updateRow(1))
            else
                res.send(updateRow(0))
        }else{//존재:삭제
            const result2 = await User_favorite_club.destroy({
                where:{uid:req.params.uid,club_id:req.body.club_id}
            });
            res.send(deleteRow(result2))
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 순서변경
router.patch('/favorite_club_list/order/:uid',async(req,res,next)=>{
    try{
        var i=0;
        var list = req.body.favorite_club_list;
        for(; i<list.length; i++){
            await User_favorite_club.update({
                itemOrder:i
            },{
                where:{uid:req.params.uid,club_id:list[i]}
            })
        }
        if(i===list.length){
            res.send(updateRow(1))
        }else{
            res.send(updateRow(0))
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 유저 삭제
router.delete('/:uid',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{id:req.params.uid}});
        if(user.image){
            fs.unlink(appDir+'/upload/'+user.image, (err) => {
                console.log(err);
            });
        }
        const result = await User.destroy({
            where:{id:req.params.uid}});
        
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;