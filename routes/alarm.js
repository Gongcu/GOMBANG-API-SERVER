const express = require('express');
const router = express.Router();
const Alarm= require('../models/alarm');

//POSTMAN: 유저의 알림@
router.get('/:uid',async(req,res,next)=>{
    try{
        const alarm = await Alarm.sequelize.query(`SELECT COALESCE(c.image,u.image) as image, COALESCE(c.name, '이벤트') as title, a.content, a.isChecked, a.createdAt `+
        `FROM alarms a left join clubs c on a.club_id=c.id left join comments cm on a.comment_id=cm.id left join users u on cm.uid=u.id `+
        `WHERE a.uid=${req.params.uid}`)
        res.send(alarm[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 유저의 알림 읽음@
router.patch('/:alarm_id',async(req,res,next)=>{
    try{
        await Alarm.update({
            isChecked:true
        },{where:{id:req.params.alarm_id}})
        res.send(true);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;