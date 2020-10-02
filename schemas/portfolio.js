const mongoose = require('mongoose');

const {Schema} = mongoose;
const {Types:{ObjectId}}=Schema;
const portfolioSchema = new Schema({
    uid:{
        type:ObjectId,
        ref:'User',
        required: true,
    },
    folder:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    },
    description:{
        type:String,
    },
    isFavorite:{
        type:Boolean,
        default:false,
    },
    favoriteTime:{
        type:String,
        default:""
    },
    post_id_list:[
        {
            type:ObjectId,
            ref:'Post'
        }
    ]
},{strict:false});

module.exports = mongoose.model('Portfolio', portfolioSchema,'portfolio');
