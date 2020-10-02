const express = require('express');
const router = express.Router();
const Post = require('../schemas/post');
const Portfolio = require('../schemas/portfolio')
const formatWriteResult = require('../etc/formatWriteResult.js');
const formatDeleteResult = require('../etc/formatDeleteResult.js');
const formatDateTime = require('../etc/formatDateTime.js');

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

//POSTMAN
router.get('/:uid',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio.find({uid:req.params.uid})//.populate('post_id_list');
        res.send(portfolio);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN
router.get('/folder/:folder_id',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio.find({_id:req.params.folder_id}).populate('post_id_list');
        res.send(portfolio);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 스크랩
router.post('/:uid',async(req,res,next)=>{
    try{
        const getItem = await Portfolio.findOne({uid:req.params.uid,folder:req.body.folder});
        //폴더가 존재하지 않을 경우
        if(getItem===null){
            const createPortpolio = await Portfolio.create({
                uid:req.params.uid,
                folder:req.body.folder,
                post_id_list:[req.body.post_id]
            });
            res.send(createPortpolio);
        }else{//폴더가 존재하는 경우
            const result = await Portfolio.updateOne({uid:req.params.uid},{$push:{post_id_list:req.body.post_id}});
            res.send(formatWriteResult(result));
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 생성
router.post('/folder/:uid',uploader.single('image'),async(req,res,next)=>{
    try{
        var createFolder;
        if(req.file){
            createFolder = await Portfolio.create({
                uid:req.params.uid,
                folder:req.body.folder,
                description:req.body.description,
                image:req.file.filename,
                post_id_list:[]
            });
        }else{
            createFolder = await Portfolio.create({
                uid:req.params.uid,
                folder:req.body.folder,
                description:req.body.description,
                post_id_list:[]
            });
        }
        res.send(createFolder);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 즐겨찾기
router.patch('/folder/favorite/:folder_id',async(req,res,next)=>{
    try{
        const set = await Portfolio.findOne({_id:req.params.folder_id});
        var result;
        if(set.isFavorite){
            result = await Portfolio.updateOne({_id:req.params.folder_id},{$set:{isFavorite:false,favoriteTime:""}}); 
        }else{
            result = await Portfolio.updateOne({_id:req.params.folder_id},{$set:{isFavorite:true,favoriteTime:formatDateTime(Date())}});
        }
        res.send(formatWriteResult(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;