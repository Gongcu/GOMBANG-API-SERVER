const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Portfolio = require('../models/portfolio')
const Portfolio_folder = require('../models/portfolio_folder');
const updateRow = require('../etc/updateRow.js');
const deleteRow = require('../etc/deleteRow.js');
const formatDateTime = require('../etc/formatDateTime.js');

//POSTMAN
router.get('/:userId',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.findAll({
            where:{userId:req.params.userId},
        })
        res.send(folder);
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
        const post = await Portfolio.findAll({where:{portfolioFolderId:req.params.portfolioFolderId}});
        folder.portfolio = post;
        res.send(folder);
    }catch(err){
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
        res.send(folder);
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
        res.send(portfolio)
    }catch(err){
        console.error(err);
        next(err);
    }
});



//POSTMAN 폴더명 수정
router.patch('/folder/:portfolioFolderId',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.update({
            name:req.body.name
        },{
            where:{id:req.params.portfolioFolderId}
        })
        res.send(updateRow(folder));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 즐겨찾기 추가/해제@ (시간)
router.patch('/folder/favorite/:portfolioFolderId',async(req,res,next)=>{
    try{
        const prevFolder = await Portfolio_folder.findOne({where:{id:req.params.portfolioFolderId}});
        prevFolder.isFavorite = !(prevFolder.isFavorite);
        if(prevFolder.isFavorite)
            prevFolder.favoriteClickedTime = formatDateTime(Date());
        else
            prevFolder.favoriteClickedTime = null;
        await prevFolder.save();
        res.send(prevFolder.isFavorite);
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN:특정 포트폴리오 삭제
router.delete('/:portfolioId',async(req,res,next)=>{
    try{
        const result = await Portfolio.destroy({where:{id:req.params.portfolioId}})
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 폴더 삭제
router.delete('/folder/:portfolioFolderId',async(req,res,next)=>{
    try{
        const result = await Portfolio_folder.destroy({where:{id:req.params.portfolioFolderId}})
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;