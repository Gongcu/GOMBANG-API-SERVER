const express = require('express');
const Calendar = require('../schemas/calendar');
const path = require('path');

const router = express.Router();

//쿼리로 달 별로 가져오게 할 건지 아니면 전체 다 가져오게 할 지 -> 성능상 무엇이 좋을까
router.get('/:uid',async(req,res,next)=>{
    try{
        const calendar = await Calendar.find({uid:req.params.uid})
        if(calendar.length===0){
            res.send('empty');
        }else{
            res.send(calendar);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/',async(req,res,next)=>{
    try{
        const body = JSON.parse(req.body.json)
        const calendar = await Calendar.create({
                uid: body.uid,
                title: body.title,
                color: body.color,
                startDate: body.startDate,
                endDate: body.endDate,
                place: body.place,
                memo: body.memo,
        });
        if(calendar.length===0){
            res.send('calendar create failed')
        }else{
            res.send(calendar);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id',async(req,res,next)=>{
    try{
        const calendar = await Calendar.remove({_id:req.params.id});
        res.send(calendar);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;