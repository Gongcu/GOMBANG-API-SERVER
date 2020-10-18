const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const Portfolio = require('../models/portfolio')
const Portfolio_folder = require('../models/portfolio_folder');
const deleteRow = require('../etc/deleteRow.js');
const formatDateTime = require('../etc/formatDateTime.js');

//POSTMAN
router.get('/:uid',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.findAll({
            where:{uid:req.params.uid},
        })
        res.send(folder);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 폴더 조회
router.get('/folder/:folder_id',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio_folder.findOne({
            where:{id:req.params.folder_id},
            include:[{
                model:Portfolio,
                include:[{
                    model:Post
                }]
            }]
        })
        res.send(portfolio);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 스크랩
router.post('/:uid',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio.create({
            fid:req.body.fid,
            pid:req.body.post_id
        })
        res.send(portfolio)
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 생성
router.post('/folder/:uid',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.create({
            uid:req.params.uid,
            name:req.body.name
        })
        res.send(folder);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더명 수정
router.patch('/folder/:fid',async(req,res,next)=>{
    try{
        const folder = await Portfolio_folder.update({
            name:req.body.name
        },{
            where:{id:req.params.fid}
        })
        res.send(folder);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN 폴더 즐겨찾기 추가/해제@ (시간)
router.patch('/folder/favorite/:fid',async(req,res,next)=>{
    try{
        const prevFolder = await Portfolio_folder.findOne({where:{id:req.params.fid}});
        prevFolder.isFavorite = !(prevFolder.isFavorite);
        if(prevFolder.isFavorite)
            prevFolder.favorite_click_time = formatDateTime(Date());
        else
            prevFolder.favorite_click_time = null;
        await prevFolder.save();
        res.send(prevFolder.isFavorite);
    }catch(err){
        console.error(err);
        next(err);
    }
});
//POSTMAN:특정 포트폴리오 삭제
router.delete('/:pid',async(req,res,next)=>{
    try{
        const result = await Portfolio.destroy({where:{id:req.params.pid}})
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 폴더 삭제
router.delete('/folder/:fid',async(req,res,next)=>{
    try{
        const result = await Portfolio_folder.destroy({where:{id:req.params.fid}})
        res.send(deleteRow(result));
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;