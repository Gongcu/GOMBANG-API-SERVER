const mongoose = require('mongoose');
const formatDate = require('../etc/formatDate.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const commentSchema = new Schema({
    uid:{
        type: ObjectId,
        ref:'User',
    },
    comment:{
        type:String,
    },
    createdAt:{
        type: String,
        default: formatDate(Date())
    },
},{strict:false});

module.exports = mongoose.model('Comment', commentSchema,'comment');

/*
{
    "uid": "DFAJ12J3NVI",
    "title": "야식 행사",
    "color": "죽전",
    "startDate": "2020-09-01",
    "endDate":"2020-09-30"
    "place": "소프트웨어 ICT관",
    "memo":"학생증 지참"",
}*/