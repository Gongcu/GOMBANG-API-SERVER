const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user');
const User_favorite_club = require('../models/user_favorite_club');
const Portfolio_folder = require('../models/portfolio_folder');
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


//테스트용 전체 유저 조회
router.get('/',async(req,res,next)=>{
    try{
        const user = await User.findAll({});
        res.status(200).send(user);
    }catch(err){
        next(err);
    }
});

//POSTMAN
router.get('/:userId',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{
                [Op.or]:[{kakaoId:req.params.userId},{id:req.params.userId}],
            },
            raw:true,
        })
        if(user){
            const favoriteClub = await User_favorite_club.sequelize.query(
                `SELECT c.id, c.name, c.image, ufc.itemOrder `+
                `FROM user_favorite_club ufc join clubs c on ufc.clubId=c.id WHERE ufc.userId=${user.id} ORDER BY itemOrder`
            );
            const signedClub = await User_favorite_club.sequelize.query(
                `SELECT c.id, c.name, c.image, cu.nickname, cu.authority, cu.alarm `+
                `FROM club_users cu join clubs c on cu.clubId=c.id WHERE cu.userId=${user.id}`
            );
            user.favoriteClub = favoriteClub[0];
            user.signedClub = signedClub[0];
    
            res.status(200).send(user);
        }else{
            res.status(204).send();
        }
    } catch(err){
        console.log(err);
        next(err);
    }
});

//POSTMAN: 즐겨찾기 동아리 조회@
router.get('/:userId/favorite_club_list',async(req,res,next)=>{
    try{
        const favoriteClub = await User_favorite_club.sequelize.query(
            `SELECT c.id, c.name, c.image, ufc.itemOrder `+
            `FROM user_favorite_club ufc join clubs c on ufc.clubId=c.id WHERE ufc.userId=${req.params.userId} ORDER BY itemOrder`
        );
        if(favoriteClub[0].length!==0)
            res.status(200).send(favoriteClub[0]);
        else{
            res.status(204).send();
        }
    }catch(err){
        next(err);
    }
});



//POSTMAN: 유저 추가@
router.post('/',uploader.single('image'),async(req,res,next)=>{
    let transaction;
    try{
        transaction = await User.sequelize.transaction();
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
                studentNumber: req.body.studentNumber,
            },{transaction:transaction});
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
                studentNumber: req.body.studentNumber,
            },{transaction:transaction});
        }
        await Portfolio_folder.create({
            userId:user.id,
            name:"기본 폴더"
        },{transaction:transaction});
        await transaction.commit();
        res.status(200).send(user);
    }catch(err){
        if(transaction) await transaction.rollback();
        next(err);
    }
});



//POSTMAN: 프로필 이미지 변경@
router.patch('/:userId/profile',uploader.single('image'),async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{id:req.params.userId}
        });
        if(user){
            let prevImageFile = user.image;
            if(req.file)
                user.image = req.file.filename;
            else
                user.image = "";
            await user.save().then(()=>{
                if(prevImageFile !== "")
                    fs.unlink(appDir + '/upload/' + prevImageFile, (err) => {
                        console.log(err);
                    });
            });
            res.status(200).send(user.image);
        }else
            res.status(204).send();
    }catch(err){
        next(err);
    }
});

//POSTMAN: 전화번호 변경@
router.patch('/:userId/phone',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{id:req.params.userId}
        });
        if(user){
            user.phone = req.body.phone;
            await user.save();
            res.status(200).send(user.phone);
        }else
            res.status(204).send();
    }catch(err){
        console.log(err);
        next(err);
    }
});

//POSTMAN: 생년월일 변경@
router.patch('/:userId/birth',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{id:req.params.userId}
        });
        if(user){
            user.birth = req.body.birth;
            await user.save();
            res.status(200).send(user.birth);
        }else
            res.status(204).send();
    }catch(err){
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 추가/삭제
router.patch('/:userId/favorite_club_list',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await User_favorite_club.sequelize.transaction();
        const exist = await User_favorite_club.findOne({
            where:{userId:req.params.userId,clubId:req.body.clubId},transaction:transaction
        });
        if(!exist){//존재하지 않음:추가
            const maxOrderedItem = await User_favorite_club.findOne({
                where:{userId:req.params.userId},
                order:[['itemOrder','DESC']],
                transaction:transaction
            })
            let maxOrder;
            if(maxOrderedItem==null){//즐겨찾기 했던 동아리가 하나도 없는경우
                maxOrder=0;
            }else{
                maxOrder= maxOrderedItem.itemOrder+1;
            }
            await User_favorite_club.create({
                userId:req.params.userId,
                clubId:req.body.clubId,
                itemOrder:maxOrder
            },{transaction:transaction}).then(()=>{
                res.status(200).send(true);
            })
        }else{//존재:삭제
            await User_favorite_club.destroy({
                where:{userId:req.params.userId,clubId:req.body.clubId}
            },{transaction:transaction}).then(()=>{
                res.status(200).send(false);
            })
        }
        await transaction.commit();
    }catch(err){
        if(transaction) await transaction.rollback();
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 순서변경@
router.patch('/:userId/favorite_club_list/order',async(req,res,next)=>{
    let transaction;
    try{
        var i=0;
        var list = req.body.favorite_club_list;
        const favoriteClubList = await User_favorite_club.findAll({where:{userId:req.params.userId}});

        if(list.length !== favoriteClubList.length)
            throw new Error("All favorite clubs required");
            
        transaction = await User_favorite_club.sequelize.transaction();
        for(; i<list.length; i++){
            await User_favorite_club.update({
                itemOrder:i
            },{
                where:{userId:req.params.userId,clubId:list[i]},transaction:transaction
            })
        }
        await transaction.commit()
        res.status(200).send(updateRow(1));
    }catch(err){
        if(transaction)
            await transaction.rollback()
        next(err);
    }
});

//POSTMAN: 유저 삭제
router.delete('/:userId',async(req,res,next)=>{
    try{
        const user = await User.findOne({where:{id:req.params.userId}});
        if(user.image){
            fs.unlink(appDir+'/upload/'+user.image, (err) => {
                console.log(err);
            });
        }
        const result = await user.destroy();
        res.status(200).send(deleteRow(result));
    }catch(err){
        next(err);
    }
});

module.exports = router;