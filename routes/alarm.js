const express = require('express');
const router = express.Router();
const Alarm= require('../models/alarm');

//POSTMAN: 유저의 알림@
router.get('/:userId',async(req,res,next)=>{
    try{
        const alarm = await Alarm.sequelize.query(`SELECT COALESCE(c.image,u.image) as image, COALESCE(c.name, '이벤트') as title, a.content, a.isChecked, a.createdAt `+
        `FROM alarms a left join clubs c on a.clubId=c.id left join comments cm on a.commentId=cm.id left join users u on cm.userId=u.id `+
        `WHERE a.userId=${req.params.userId}`);
        if(alarm[0].length)
            res.status(200).send(alarm[0]);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 유저의 알림 읽음@
router.patch('/:alarmId',async(req,res,next)=>{
    try{
        const result = await Alarm.update({
            isChecked:true
        },{where:{id:req.params.alarmId}})
        if(updateRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;