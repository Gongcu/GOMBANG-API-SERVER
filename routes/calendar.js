const express = require('express');
const Calendar = require('../schemas/calendar');

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
        const calendar = await Calendar.create({
                uid: req.body.uid,
                title: req.body.title,
                color: req.body.color,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                place: req.body.place,
                memo: req.body.memo,
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

router.patch('/:id',async(req,res,next)=>{
    try{
        //전체 정보 다시 전달 받기(uid 제외 모두 업데이트)
        const calendar = await Calendar.updateOne({_id:req.params.id},{$set:
                {title:req.body.title,
                color:req.body.color,
                startDate:req.body.startDate,
                endDate:req.body.endDate,
                place:req.body.place,
                memo:req.body.memo
            }});
        res.send(calendar);
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

/*
{   //PUT 예시 데이터
    “_id”: “FAUSHDHFIUA”
    "uid": "DFAJ12J3NVI",
    "title": "야식 행사",
    "color": "RED",
    "startDate": "2020/09/01 00:00,
    "endDate":"2020/09/30 00:00"
    "place": "소프트웨어 ICT관",
    "memo":"학생증 지참",
}
*/

