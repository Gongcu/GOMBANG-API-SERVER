const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            kakaoId:{
                type:Sequelize.STRING(30),
                allowNull:false,
                unique:true,
            },
            token:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            name:{
                type:Sequelize.STRING(20),
                allowNull:false,
            },
            image:{
                type:Sequelize.STRING(100),
                allowNull:false,
                defaultValue:"",
            },
            email:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            phone:{
                type:Sequelize.STRING(20),
                allowNull:true,
            },
            birth:{
                type:Sequelize.STRING(20),
                allowNull:true,
            },
            studentNumber:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            campus:{
                type:Sequelize.STRING(5),
                allowNull:true,
            },
            college:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            department:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            pushAlarm:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'User',
            tableName:'users',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.User.hasMany(db.Club_user,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.ApplicationForm,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.User_favorite_club,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Question,{foreignKey:'userId',sourceKey:'id'});

        db.User.hasMany(db.Post,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Comment,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Like,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Post_participation_user,{foreignKey:'userId',sourceKey:'id'});

        db.User.hasMany(db.Portfolio_folder,{foreignKey:'userId',sourceKey:'id'});

        db.User.hasMany(db.Chat,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Chatroom_user,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Chatroom_con_user,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Chat_unread_user,{foreignKey:'userId',sourceKey:'id'});

        db.User.hasMany(db.Alarm,{foreignKey:'userId',sourceKey:'id'});
        db.User.hasMany(db.Alarm,{foreignKey:'triggerUserId',sourceKey:'id'});
    }
};