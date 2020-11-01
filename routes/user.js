const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../models/user');
const Club = require('../models/club');
const Club_user = require('../models/club_user');
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
router.get('/:userId',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{
                [Op.or]:[{kakaoId:req.params.userId},{id:req.params.userId}],
            },
            raw:true,
        })
        const favoriteClub = await User_favorite_club.sequelize.query(
            `SELECT c.id, c.name, c.image, ufc.itemOrder `+
            `FROM user_favorite_club ufc join clubs c on ufc.clubId=c.id WHERE ufc.userId=${req.params.userId} ORDER BY itemOrder`
        );
        const signedClub = await User_favorite_club.sequelize.query(
            `SELECT c.id, c.name, c.image, cu.nickname, cu.authority, cu.alarm `+
            `FROM club_users cu join clubs c on cu.clubId=c.id WHERE cu.userId=${req.params.userId}`
        );
        user.favoriteClub = favoriteClub[0];
        user.signedClub = signedClub[0];

        res.send(user);
    } catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 즐겨찾기 동아리 조회@
router.get('/:userId/favorite_club_list',async(req,res,next)=>{
    try{
        const list = await User_favorite_club.findAll({
            where:{userId:req.params.userId},
            attributes:{exclude:['userId','clubId','id'] },
            include:[{
                model:Club,
                attributes:['id','name','image']
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
                studentNumber: req.body.studentNumber,
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
                studentNumber: req.body.studentNumber,
            });
        }
        await Portfolio_folder.create({
            userId:user.id,
            name:"기본 폴더"
        })
        res.send(user);
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN: 프로필 이미지 변경@
router.patch('/:userId/profile',uploader.single('image'),async(req,res,next)=>{
    try{
        if(req.file){
            const prevUserProfile = await User.findOne({
                where:{id:req.params.userId}
            });
            if(prevUserProfile.image !== "")
                fs.unlink(appDir + '/upload/' + prevUserProfile.image, (err) => {
                    console.log(err);
                });
            const user = await User.update({
                image:req.file.filename
            },{
                where:{id:req.params.userId}
            });
            if(updateRow(user)){
                res.send(req.file.filename)
            }else{
                res.send(updateRow(user));
            }
        }else{
            res.send(false);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 추가/삭제
router.patch('/:userId/favorite_club_list',async(req,res,next)=>{
    try{
        const exist = await User_favorite_club.findOne({
            where:{userId:req.params.userId,clubId:req.body.clubId}
        });
        if(!exist){//존재하지 않음:추가
            const maxOrderedItem = await User_favorite_club.findOne({
                where:{userId:req.params.userId},
                order:[['itemOrder','DESC']],
            })
            let maxOrder;
            if(maxOrderedItem==null){//즐겨찾기 했던 동아리가 하나도 없는경우
                maxOrder=0;
            }else{
                maxOrder= maxOrderedItem.itemOrder+1;
            }
            const result1 = await User_favorite_club.create({
                userId:req.params.userId,
                clubId:req.body.clubId,
                itemOrder:maxOrder
            })
            if(result1)
                res.send(true)
            else
                res.send("err:cannnot add the club")
        }else{//존재:삭제
            const result2 = await User_favorite_club.destroy({
                where:{userId:req.params.userId,clubId:req.body.clubId}
            });
            if(result2)
                res.send(false)
            else
                res.send("err:cannnot delete the club")
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 즐겨찾기 순서변경@
router.patch('/:userId/favorite_club_list/order',async(req,res,next)=>{
    let transaction;
    try{
        var i=0;
        var list = req.body.favorite_club_list;
        transaction = await User_favorite_club.sequelize.transaction();
        for(; i<list.length; i++){
            await User_favorite_club.update({
                itemOrder:i
            },{
                where:{userId:req.params.userId,clubId:list[i]},transaction:transaction
            })
        }
        await transaction.commit()
        if(i===list.length){
            res.send(updateRow(1))
        }else{
            res.send(updateRow(0))
        }
    }catch(err){
        if(transaction)
            await transaction.rollback()
        console.error(err);
        next(err);
    }
});

//POSTMAN: 유저 삭제
router.delete('/:userId',async(req,res,next)=>{
    try{
        const user = await User.findOne({
            where:{id:req.params.userId}});
        if(user.image){
            fs.unlink(appDir+'/upload/'+user.image, (err) => {
                console.log(err);
            });
        }
        const result = await User.destroy({
            where:{id:req.params.userId}});
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;