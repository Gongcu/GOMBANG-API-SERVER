const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime');

module.exports = class Post extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            isNotice:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            isEvent:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            text:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            participationFee:{
                type:Sequelize.INTEGER,
                allowNull:false,
                defaultValue:0,
            },
            title:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            color:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            startDate:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            endDate:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            place:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            memo:{
                type:Sequelize.STRING,
                allowNull:true,
            },
            createdAt:{
                type:Sequelize.STRING,
                allowNull:false,
                defaultValue:formatDateTime(Date()),
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Post',
            tableName:'posts',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Post.belongsTo(db.User,{foreignKey:'userId',targetKey:'id'});
        db.Post.belongsTo(db.Club,{foreignKey:'clubId',targetKey:'id'});

        db.Post.hasMany(db.File,{foreignKey:'postId',sourceKey:'id',onDelete: 'CASCADE'}); //banner, image, file, video
        db.Post.hasMany(db.Post_participation_user,{foreignKey:'postId',sourceKey:'id',onDelete: 'CASCADE'}); 
        db.Post.hasMany(db.Comment,{foreignKey:'postId',sourceKey:'id',onDelete: 'CASCADE'});
        db.Post.hasMany(db.Like,{foreignKey:'postId',sourceKey:'id',onDelete: 'CASCADE'});
        db.Post.hasMany(db.Portfolio,{foreignKey:'postId',sourceKey:'id',onDelete: 'CASCADE'});

        db.Post.hasMany(db.Alarm,{foreignKey:'postId',sourceKey:'id',onDelete: 'CASCADE'});
    }
};