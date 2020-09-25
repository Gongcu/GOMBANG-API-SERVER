const mongoose = require('mongoose');
const formatDateTime = require('../etc/formatDateTime.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const commentSchema = new Schema({
    post_id:{
        type: ObjectId,
        ref:'Post',
        required:true
    },
    uid:{
        type: ObjectId,
        ref:'User',
        required: true,
    },
    comment:{
        type:String,
        required: true,
    },
    createdAt:{
        type: String,
        default: formatDateTime(Date())
    },
},{strict:false});

module.exports = mongoose.model('Comment', commentSchema,'comment');
