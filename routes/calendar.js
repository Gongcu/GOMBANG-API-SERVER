const express = require('express');
const deleteRow = require('../etc/deleteRow');
const updateRow = require('../etc/updateRow');
const Calendar = require('../models/calendar');
const router = express.Router();

//쿼리로 달 별로 가져오게 할 건지 아니면 전체 다 가져오게 할 지 -> 성능상 무엇이 좋을까
router.get('/:uid',async(req,res,next)=>{
    try{
        const calendar = await Calendar.findAll({
            where:{uid:req.params.uid}
        })
        res.send(calendar);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 일정추가@
router.post('/',async(req,res,next)=>{
    try{
        const calendar = await Calendar.create({
                uid: req.body.uid,
                title: req.body.title,
                color: req.body.color,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                place: req.body.place,
                memo: req.body.memo,
        });
        res.send(calendar)
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 일정 수정@
router.patch('/:id',async(req,res,next)=>{
    try{
        //전체 정보 다시 전달 받기(uid 제외 모두 업데이트)
        const calendar = await Calendar.findOne({where:{id:req.params.id}})
        if(calendar){
            calendar.title=req.body.title;
            calendar.color=req.body.color;
            calendar.startDate=req.body.startDate;
            calendar.endDate=req.body.endDate;
            calendar.place = req.body.place;
            calendar.memo=req.body.memo
            await calendar.save();
            res.send(calendar);
        }else{
            res.send(updateRow(0))
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 일정 삭제
router.delete('/:id',async(req,res,next)=>{
    try{
        const calendar = await Calendar.destroy({
            where:{id:req.params.id}
        });
        res.send(deleteRow(calendar));
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;

