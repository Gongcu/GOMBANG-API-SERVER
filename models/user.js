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
                type:Sequelize.STRING(100),
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
            student_number:{
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
            push_alarm:{
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
        db.User.hasMany(db.Club_user,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.ApplicationForm,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.User_favorite_club,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Question,{foreignKey:'uid',sourceKey:'id'});

        db.User.hasMany(db.Post,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Comment,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Like,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Post_participation_user,{foreignKey:'uid',sourceKey:'id'});

        db.User.hasMany(db.Portfolio_folder,{foreignKey:'uid',sourceKey:'id'});

        db.User.hasMany(db.Chat,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Chatroom_user,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Chatroom_con_user,{foreignKey:'uid',sourceKey:'id'});
        db.User.hasMany(db.Chat_unread_user,{foreignKey:'uid',sourceKey:'id'});
    }
};