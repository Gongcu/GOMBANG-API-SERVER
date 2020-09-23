const mongoose = require('mongoose');
const formatDate = require('../etc/formatDate.js');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const commentSchema = new Schema({
    //postId 필요 없을듯?
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
