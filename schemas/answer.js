const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const answerSchema = new Schema({
    uid:{
        type: String,
        ref:'User',
        required: true,
    },
    answer:{
        type:String,
        required:true,
    },
    createdAt:{
        type:String,
        default:Date.now().toString(),
    }
},{strict:false});

module.exports = mongoose.model('Answer', answerSchema,'answer');

/*
{
    "club_id": "DFAFWER",
    "uid": "DFAFEIONVAN",
    "question": "16학번도 가입되나요",
    "president_uid": "a1233jnb",
    "createdAt":""
}*/