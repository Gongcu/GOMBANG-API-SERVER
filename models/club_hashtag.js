const Sequelize = require('sequelize');

module.exports = class Club_hashtag extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Club_hashtag',
            tableName:'club_hashtags',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Club_hashtag.belongsTo(db.Hashtag,{foreignKey:'hashtagId',targetKey:'id'});
        db.Club_hashtag.belongsTo(db.Club,{foreignKey:'clubId',targetKey:'id'});
    }
};