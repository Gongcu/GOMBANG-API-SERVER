const Sequelize = require('sequelize');

module.exports = class Club_hashtag extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Club_hashtag',
            tableName:'club_hashtag',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Club_hashtag.belongsTo(db.Hashtag,{foreignKey:'hid',targetKey:'id'});
        db.Club_hashtag.belongsTo(db.Club,{foreignKey:'club_id',targetKey:'id'});
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