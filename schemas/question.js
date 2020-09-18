const mongoose = require('mongoose');
const formatDate = require('../etc/formatDate.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const questionSchema = new Schema({
    club_id:{
        type: ObjectId,
        ref:'Club',
        required: true,
    },
    uid:{
        type: String,
        ref:'User',
        required: true,
    },
    question:{
        type:String,
        required:true,
        default:null,
    },
    answer:{
        type:ObjectId,
        ref:'Answer'
    },
    isAnswered:{
        type:Boolean,
        default:false,
    },
    createdAt:{
        type:String,
        default:formatDate(Date()),
    }
},{strict:false});



module.exports = mongoose.model('Question', questionSchema,'question');

/*
{
    "club_id": "DFAFWER",
    "uid": "DFAFEIONVAN",
    "question": "16학번도 가입되나요",
    "president_uid": "a1233jnb",
    "createdAt":""
}*/