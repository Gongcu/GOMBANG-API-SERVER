const express = require('express');
const router = express.Router();
const File = require('../models/file');
const Post = require('../models/post');
const Portfolio = require('../models/portfolio')
const Portfolio_folder = require('../models/portfolio_folder');
const updateRow = require('../etc/updateRow.js');
const deleteRow = require('../etc/deleteRow.js');
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
router.get('/:userId',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.findAll({
            where:{userId:req.params.userId},
        })
        if(folder.length)
            res.status(200).send(folder);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 폴더 조회
router.get('/folder/:portfolioFolderId',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.findOne({
            where:{id:req.params.portfolioFolderId},raw:true
        });
        if(folder){
            const post = await Portfolio.findAll({where:{portfolioFolderId:req.params.portfolioFolderId}});
            folder.portfolio = post;
            res.status(200).send(folder);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 포트폴리오 직접 작성@
router.post('/',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Post.sequelize.transaction();
        const post = await Post.create({
            userId: req.body.userId,
            text: req.body.text,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        },{transaction:transaction});

        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({postId:post.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({postId:post.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({postId:post.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
        }

        await Portfolio.create({
            portfolioFolderId:req.body.portfolioFolderId,
            userId:req.body.userId,
            postId:post.id
        },{transaction:transaction})

        const result = await Post.findOne({
            where:{id:post.id},
            include:[{
                model:File,
                attributes:['name','type']
            }],transaction:transaction});
        await transaction.commit();
        res.status(200).send(result);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 생성
router.post('/folder',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.create({
            userId:req.body.userId,
            name:req.body.name
        })
        res.status(200).send(folder);
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN: 스크랩
router.post('/:postId',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio.create({
            portfolioFolderId:req.body.portfolioFolderId,
            userId:req.body.userId,
            postId:req.params.postId
        })
        res.status(200).send(portfolio)
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN 폴더명 수정
router.patch('/folder/:portfolioFolderId',async(req,res,next)=>{
    try{
        const result = await Portfolio_folder.update({
            name:req.body.name
        },{
            where:{id:req.params.portfolioFolderId}
        });
        if(updateRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 즐겨찾기 추가/해제@ (시간)
router.patch('/folder/favorite/:portfolioFolderId',async(req,res,next)=>{
    try{
        const prevFolder = await Portfolio_folder.findOne({where:{id:req.params.portfolioFolderId}});
        if(prevFolder){
            prevFolder.isFavorite = !(prevFolder.isFavorite);
            if(prevFolder.isFavorite)
                prevFolder.favoriteClickedTime = formatDateTime(Date());
            else
                prevFolder.favoriteClickedTime = null;
            await prevFolder.save();
            res.status(200).send(prevFolder.isFavorite);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN:특정 포트폴리오 삭제
router.delete('/:portfolioId',async(req,res,next)=>{
    try{
        const result = await Portfolio.destroy({where:{id:req.params.portfolioId}});
        if(deleteRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 폴더 삭제
router.delete('/folder/:portfolioFolderId',async(req,res,next)=>{
    try{
        const result = await Portfolio_folder.destroy({where:{id:req.params.portfolioFolderId}})
        if(deleteRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;