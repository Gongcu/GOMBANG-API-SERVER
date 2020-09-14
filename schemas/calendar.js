const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const calendarSchema = new Schema({
    uid:{
        type: ObjectId,
        ref:'User',
    },
    title:{
        type:String,
    },
    color:{
        type: String,
    },
    startDate:{
        type: String,
    },
    endDate:{
        type:String,
    },
    place:{
        type:String,
        default:"",
    },
    memo:{
        type:String,
        default:""
    },
},{strict:false});

module.exports = mongoose.model('Calendar', calendarSchema,'calendar');

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