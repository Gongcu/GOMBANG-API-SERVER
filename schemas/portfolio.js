const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const portfolioSchema = new Schema({
    uid:{
        type:ObjectId,
        ref:'User',
        required: true,
    },
    portfolio:[
        {
            name:String,
            post_id_list:[ObjectId]
        }
    ]
    //포트폴리오 스크랩 리스트 일단 post_id로 리스트 구성
    //포트폴리오 폴더
    //https://stackoverflow.com/questions/28200502/map-in-mongoose
    
},{strict:false});


module.exports = mongoose.model('Portfolio', portfolioSchema,'portfolio');
