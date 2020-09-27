const express = require('express');
const router = express.Router();
const Post = require('../schemas/post');
const Portfolio = require('../schemas/portfolio')
const formatWriteResult = require('../etc/formatWriteResult.js');
const formatDeleteResult = require('../etc/formatDeleteResult.js');


//POSTMAN
router.get('/',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio.find({});
        if(portfolio.length===0){
            res.send('empty');
        }else{
            res.send(portfolio);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:uid',async(req,res,next)=>{
    try{
        const portfolio = await Portfolio.update({_id:req.params.uid})
        if(portfolio===null){

        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/folder/:uid',async(req,res,next)=>{
    try{
        var object = {
            name: req.body.folder,
            post_id_list:[]
        }
        const portfolio = await Portfolio.updateOne({uid:req.params.uid},{$push:{portfolio:object}})
        res.send(formatWriteResult(portfolio));
    }catch(err){
        console.error(err);
        next(err);
    }
});






module.exports = router;