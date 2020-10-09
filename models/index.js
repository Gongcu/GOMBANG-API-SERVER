const Sequelize = require('sequelize');
const User = require('./user');
const Club = require('./club');
const Club_user = require('./club_user');
const Hashtag = require('./hashtag');
const ApplicationForm = require('./applicationForm');
const Calendar = require('./calendar');
const User_favorite_club = require('./user_favorite_club');
const Answer = require('./answer');
const Question = require('./question');

const Post = require('./post');
const Comment = require('./comment');
const File = require('./file');
const Like = require('./like');
const Post_paid_user = require('./post_paid_user');
const Post_participation_user = require('./post_participation_user');


const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database,config.username,config.password,config)

db.sequelize = sequelize;

db.User=User;
db.Club=Club;
db.Club_user=Club_user;
db.Hashtag=Hashtag;
db.ApplicationForm=ApplicationForm;
db.Calendar=Calendar;
db.User_favorite_club=User_favorite_club;
db.Answer=Answer;
db.Question=Question;
db.Post=Post;
db.Comment=Comment;
db.File=File;
db.Like=Like;
db.Post_paid_user=Post_paid_user;
db.Post_participation_user=Post_participation_user;


User.init(sequelize);
Club.init(sequelize);
Club_user.init(sequelize);
Hashtag.init(sequelize);
ApplicationForm.init(sequelize);
Calendar.init(sequelize);
User_favorite_club.init(sequelize);
Answer.init(sequelize);
Question.init(sequelize);
Post.init(sequelize);
Comment.init(sequelize);
File.init(sequelize);
Like.init(sequelize);
Post_paid_user.init(sequelize);
Post_participation_user.init(sequelize);


User.associate(db);
Club.associate(db);
Club_user.associate(db);
Hashtag.associate(db);
ApplicationForm.associate(db);
Calendar.associate(db);
User_favorite_club.associate(db);
Answer.associate(db);
Question.associate(db);
Post.associate(db);
Comment.associate(db);
Like.associate(db);
File.associate(db);
Post_paid_user.associate(db);
Post_participation_user.associate(db);

module.exports = db;
