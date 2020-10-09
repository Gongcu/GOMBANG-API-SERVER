const Sequelize = require('sequelize');

module.exports = class Hashtag extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            hashtag:{
                type:Sequelize.STRING(30),
                allowNull:false,
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Hashtag',
            tableName:'hashtags',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Hashtag.belongsToMany(db.Club,{through:'ClubHashtag',as:'clubs'});
    }
};

/*
president_uid:{ 없어도 될듯
    type: String,
    required: true,
},
hashtags:[
    {
        type:String
    }
]*/