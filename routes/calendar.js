const express = require('express');
const deleteRow = require('../etc/deleteRow');
const Calendar = require('../models/calendar');
const router = express.Router();

//쿼리로 달 별로 가져오게 할 건지 아니면 전체 다 가져오게 할 지 -> 성능상 무엇이 좋을까
router.get('/:userId',async(req,res,next)=>{
    try{
        const calendar = await Calendar.findAll({
            where:{userId:req.params.userId}
        });
        if(calendar.length)
            res.status(200).send(calendar);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 일정추가@
router.post('/',async(req,res,next)=>{
    try{
        const calendar = await Calendar.create({
                userId: req.body.userId,
                title: req.body.title,
                color: req.body.color,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                place: req.body.place,
                memo: req.body.memo,
        });
        res.status(200).send(calendar)
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 일정 수정@
router.patch('/:calendarId',async(req,res,next)=>{
    try{
        const calendar = await Calendar.findOne({where:{id:req.params.calendarId}})
        
        if(calendar){
            calendar.title=req.body.title;
            calendar.color=req.body.color;
            calendar.startDate=req.body.startDate;
            calendar.endDate=req.body.endDate;
            calendar.place = req.body.place;
            calendar.memo=req.body.memo
            await calendar.save();
            res.status(200).send(calendar);
        }else{
            res.status(204).send()
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 일정 삭제
router.delete('/:calendarId',async(req,res,next)=>{
    try{
        const calendar = await Calendar.destroy({
            where:{id:req.params.calendarId}
        });
        if(deleteRow(calendar).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


module.exports = router;

