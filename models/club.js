const Sequelize = require('sequelize');

module.exports = class Club extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            image:{
                type:Sequelize.STRING(100),
                allowNull:true,
            },
            campus:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            text:{
                type:Sequelize.STRING(250),
                allowNull:true,
                defaultValue:"",
            },
            nickname_rule:{
                type:Sequelize.STRING(30),
                allowNull:true,
            },
            certification:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            type:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            classification:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            membership_fee:{
                type:Sequelize.INTEGER,
                allowNull:true,
                defaultValue:0,
            },
            member_count:{
                type:Sequelize.INTEGER,
                allowNull:true,
            },
            recruitment:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true,
            },
            exposure:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true,
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Club',
            tableName:'clubs',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Club.hasMany(db.Club_user,{foreignKey:'cid',sourceKey:'id'});
        db.Club.hasMany(db.ApplicationForm,{foreignKey:'cid',sourceKey:'id'});
        db.Club.hasMany(db.User_favorite_club,{foreignKey:'cid',sourceKey:'id'});

        db.Club.belongsToMany(db.Hashtag,{through:'ClubHashtag',as:'hashtags'});
    }
};