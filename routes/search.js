const express = require('express');
const {Op} = require('sequelize');
const _ = require('underscore')
const Club = require('../models/club');
const Club_hashtag= require('../models/club_hashtag');
const Hashtag= require('../models/hashtag');
const router = express.Router();

//POSTMAN: 일반 검색으로 동아리 검색. -> 해시태그 결과, 동아리명 결과 둘다 출력
router.get('/:query', async (req, res, next) => {
    try {
        var clubList=[]
        const result1 = await Club.sequelize.query(
            `SELECT * FROM clubs WHERE name LIKE '%${req.params.query}%'`)
        clubList=result1[0];
        const result2 = await Hashtag.findAll({
            where: {
                hashtag:{[Op.like]:`${req.params.query}`}
            },
            include: [{
                model: Club_hashtag,
                include: [{
                    model: Club
                }]
            }],
            plain:true
        });
        if (result2 != null) {
            for (var i = 0; i < result2.Club_hashtags.length; i++) {
                clubList.push(result2.Club_hashtags[i].Club)
            }
        }
        clubList = _.uniq(clubList, 'id'); //중복 제거
        clubList  = clubList.filter(function(item) { //NULL요소 제거
            return item !== null && item !== undefined && item !== '';
          });
        if(clubList)
            res.status(200).send(clubList);
        else
            res.status(204).send();
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 해시태그로 동아리 검색
router.get('/hashtag/:hashtag',async(req,res,next)=>{
    try{
        var clubList = [];
        const result = await Hashtag.findOne({
            where:{Hashtag:req.params.hashtag},
            include:[{
                model:Club_hashtag,
                include:[{
                    model:Club
                }]
            }]
        });
        for(var i=0; i<result.Club_hashtags.length; i++){
            clubList.push(result.Club_hashtags[i].Club)
        }
        clubList = _.uniq(clubList, 'id'); //중복 제거
        clubList  = clubList.filter(function(item) { //NULL요소 제거
            return item !== null && item !== undefined && item !== '';
        });
        if(clubList)
            res.status(200).send(clubList);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;