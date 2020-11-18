const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Post = require('../models/post');
const Comment = require('../models/comment')
const Like = require('../models/like');
const File = require('../models/file')
const Post_participation_user = require('../models/post_participation_user');
const Alarm = require('../models/alarm');
const multer = require('multer');
const updateRow = require('../etc/updateRow.js');
const deleteRow = require('../etc/deleteRow.js');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');
const Club_user = require('../models/club_user');
const fcmPushGenerator = require('../fcm/fcmPushGenerator')
var appDir = path.dirname(require.main.filename);
const uploader = multer({
    storage: multer.diskStorage({
        destination(req,file,cb){
            cb(null, 'upload/');
        },
        filename(req,file,cb){
            const ext = path.extname(file.originalname);
            cb(null, path.basename(file.originalname,ext)+Date.now()+ext);
        }
    }),
    limits: {fileSize: 5*1024*1024},
});

//POSTMAN:이벤트 조회@
router.get('/event',async(req,res,next)=>{
    try{
        const events = await Post.sequelize.query(`SELECT id FROM posts WHERE isEvent=true`);
        if(events[0].length){
            for(var i=0; i<events[0].length; i++){
                const banner = await File.findOne({
                    where:{id:events[0][i].id, type:'banner'}
                })
                events[0][i].banner = banner.name;
            }
            res.status(200).send(events[0]);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 동아리의 게시글 조회@
router.get('/:clubId',async(req,res,next)=>{
    try{
        const post = await Post.sequelize.query(`SELECT p.id, u.id userId,u.name , u.image, p.isNotice, p.isEvent, p.text, p.participationFee, `+
            `p.title, p.color, p.startDate, p.endDate, p.place, p.memo, p.createdAt,COALESCE(l.count,0) as like_count,COALESCE(c.count,0) as comment_count ` +
            `FROM posts p left join (select postId, count(*) count from likes group by postId) l on p.id=l.postId left join (select postId, count(*) count from comments group by postId) c on p.id=c.postId join users u on p.userId = u.id ` +
            `WHERE p.clubId=${req.params.clubId}`,{raw:true}
        );
        
        if(post[0].length){
            for(var i=0; i<post[0].length; i++){
                const files = await File.sequelize.query(
                    `SELECT type, name `+
                    `FROM files WHERE postId=${post[0][i].id}`
                );

                post[0][i].Files = files[0];
            }
            res.status(200).send(post[0]);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN:특정 게시글에 대한 자세한 조회@
router.get('/:postId/detail',async(req,res,next)=>{
    try{
        var post = await Post.findOne({
            where:{id:req.params.postId},
            raw:true
        });
        if(post){
            var files = await File.sequelize.query(
                `SELECT type, name `+
                `FROM files WHERE postId=${req.params.postId}`
            )
            var likes = await Like.sequelize.query(
                `SELECT u.id, u.name, u.image `+
                `FROM likes l join users u on l.userId=u.id WHERE l.postId=${req.params.postId}`
            )
            var comments = await Comment.sequelize.query(
                `SELECT u.id, u.name, u.image, c.comment, c.createdAt `+
                `FROM comments c join users u on c.userId=u.id WHERE c.postId=${req.params.postId} order by c.createdAt asc`
            )
       
            var post_participation_users = await Comment.sequelize.query(
                `SELECT u.id, u.name, u.image, p.payment `+
                `FROM post_participation_users p join users u on p.userId=u.id WHERE p.postId=${req.params.postId}`
            )
            post.Files=files[0];
            post.likes=likes[0];
            post.comments=comments[0];
            post.post_participation_users=post_participation_users[0];
    
            res.status(200).send(post);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 특정 게시글의 댓글 조회@
router.get('/:postId/comment',async(req,res,next)=>{
    try{
        const comments = await Comment.sequelize.query(
            `SELECT u.id, u.name, u.image, c.comment, c.createdAt `+
            `FROM comments c join users u on c.userId=u.id WHERE c.postId=${req.params.postId} order by c.createdAt asc`
        )
        if(comments[0].length){
            res.status(200).send(comments[0]);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 동아리의 게시글 조회@
router.get('/:clubId/:userId',async(req,res,next)=>{
    try{
        const post = await Post.sequelize.query(`SELECT p.id, u.id userId,u.name , u.image, p.isNotice, p.isEvent, p.text, p.participationFee, `+
            `p.title, p.color, p.startDate, p.endDate, p.place, p.memo, p.createdAt,COALESCE(l.count,0) as like_count,COALESCE(c.count,0) as comment_count ` +
            `FROM posts p left join (select postId, count(*) count from likes group by postId) l on p.id=l.postId left join (select postId, count(*) count from comments group by postId) c on p.id=c.postId join users u on p.userId = u.id ` +
            `WHERE p.clubId=${req.params.clubId}`,{raw:true}
        );
        
        if(post[0].length){
            for(var i=0; i<post[0].length; i++){
                const files = await File.sequelize.query(
                    `SELECT type, name `+
                    `FROM files WHERE postId=${post[0][i].id}`
                );
                const like = await Like.findOne({
                    where:{postId:post[0][i].id,userId:req.params.userId}
                })
                post[0][i].Files = files[0];

                if(like)
                    post[0][i].like = true;
                else
                    post[0][i].like = false;
            }
            res.status(200).send(post[0]);
        }else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN:참가자 엑셀로 내보내기@
router.get('/:postId/participation/export',async(req,res,next)=>{
    try{
        const post = await Post.findOne({where:{id:req.params.postId}});
        const post_participation_users = await Comment.sequelize.query(
            `SELECT u.id, u.name, u.image, p.payment `+
            `FROM post_participation_users p join users u on p.userId=u.id WHERE p.postId=${req.params.postId}`
        )
        const filename = post.id+"_"+post.title + " 참가 목록.xlsx";
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`참가자 명단`);
        sheet.columns = [
            {header:'이름',key:'name'},
            {header:'납부여부',key:'payment'}
        ]
        var list = post_participation_users[0];
        var paid_user_count = 0;
        for(var i=0; i<list.length; i++){
            if(list[i].payment){
                sheet.addRow({name:list[i].name,payment:"O"});
                paid_user_count++;
            }
            else
                sheet.addRow({name:list[i].name,payment:"X"});
        }
        sheet.addRow({name:'총 참가비',payment:post.participationFee*paid_user_count})
        sheet.addRow({name:'참가자 수',payment:list.length})
        sheet.addRow({name:'납부자 수',payment:paid_user_count})

        sheet.getRow(1).font = {bold:true} //첫 행: 컬럼 제목
        sheet.getRow(i+2).font = {bold:true} //참가비
        sheet.getRow(i+3).font = {bold:true} //참가자 수
        sheet.getRow(i+4).font = {bold:true} //납부자 수

        workbook.xlsx.writeFile(appDir+'/excel/'+filename).then(_=>{
            res.status(200).send(filename);
        }).catch((error)=>{
            next(error);
        })
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 동아리 게시글 작성@+PUSH
router.post('/',uploader.fields([{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Post.sequelize.transaction();
        const post = await Post.create({
            userId: req.body.userId,
            clubId: req.body.clubId,
            text: req.body.text,
            isNotice:req.body.isNotice,
            participationFee: req.body.participationFee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        },{transaction:transaction});

        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({postId:post.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({postId:post.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({postId:post.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
        }
        const result = await Post.findOne({
            where:{id:post.id},
            include:[{
                model:File,
                attributes:['name','type']
            }],transaction:transaction});
        if(post.isNotice){//PUSH
            var token = new Array();

            const users = await User.sequelize.query(
                `SELECT u.id, u.token FROM club_users cu join users u on cu.userId=u.id `+
                `WHERE u.id <> ${post.userId} AND cu.clubId=${req.body.clubId} AND u.pushAlarm=true AND cu.alarm = true`,
                {transaction:transaction}
            )
            for(var i=0; i<users[0].length; i++){
                token[i] = users[0][i].token;
                await Alarm.create({
                    userId:users[0][i].id,
                    content:"새로운 공지사항이 등록되었습니다.",
                    postId:post.id,
                    clubId:post.clubId
                },{transaction:transaction});
            }

            fcmPushGenerator(token, "새로운 공지사항이 등록되었습니다.",post.id,"post");
        }
        await transaction.commit();
        res.status(200).send(result);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 이벤트 글 작성@+PUSH
router.post('/event',uploader.fields([{name:'banner'},{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        if(typeof req.files['banner']=='undefined'){
            res.send("banner required")
        }
        transaction = await Post.sequelize.transaction();
        const post = await Post.create({
            userId: req.body.userId,
            clubId: req.body.clubId,
            isNotice:req.body.isNotice,
            isEvent:true,
            text: req.body.text,
            participationFee: req.body.participationFee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        });
        await File.create({postId:post.id,type:"banner",name:req.files['banner'][0].filename},{transaction:transaction})
        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({postId:post.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({postId:post.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({postId:post.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
        }
        const result = await Post.findOne({
            where:{id:post.id},
            include:[{
                model:File,
                attributes:['name','type']
            }],transaction:transaction});
        //작성자 빼고 모두 알림 + PUSH
        var token = new Array()

        const users = await User.sequelize.query(
            `SELECT id, token FROM users WHERE pushAlarm = true AND id <> ${req.body.userId}`,
            {transaction:transaction}
        )

        for(var i=0; i<users[0].length; i++){
            token[i]=users[0][i].token

            await Alarm.create({
                userId:users[0][i].id,
                content:"새로운 이벤트가 생성되었습니다.",
                postId:post.id
            },{transaction:transaction});
        }
        
        fcmPushGenerator(token, "새로운 이벤트가 생성되었습니다.",post.id, "post");
        
        await transaction.commit();
        res.status(200).send(result);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 작성@ +PUSH
router.post('/:postId/comment',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Comment.sequelize.transaction();
        //1. content에 사용될 name 추출
        const post = await Post.findOne({
            where:{id:req.params.postId},
            transaction:transaction
        })
        let name;
        if(post.isEvent){
            const user = await User.findOne({
                where:{id:req.body.userId},attributes:['name'],
                transaction:transaction
            });
            name=user.name;
        }else{
            const club_user = await Club_user.findOne({
                where:{userId:req.body.userId},attributes:['nickname'],
                transaction:transaction
            })
            name=club_user.nickname;
        }

        //댓글 작성
        const comment = await Comment.create({
            postId:req.params.postId,
            userId:req.body.userId,
            comment: req.body.comment,
        },{transaction:transaction});
        
        //PUSH
        var token = new Array();

        //알람 보낼 유저들 선정 - (댓글 작성자/게시글작성자 제외, 게시글 작성자는 아래서 따로 호출하기 때문)
        const comment_user = await Comment.sequelize.query(
            `SELECT DISTINCT(u.id) as userId, u.token FROM comments c join users u on c.userId=u.id join club_users cu on u.id=cu.userId `+
            `WHERE c.postId=${req.params.postId} and c.userId <> ${post.userId} and c.userId <> ${req.body.userId} and u.pushAlarm=true and cu.alarm=true`,
            {transaction:transaction}
        )

        //알람
        for(var i=0; i<comment_user[0].length; i++){
            token[i]= comment_user[0][i].token;
            await Alarm.create({
                userId:comment_user[0][i].userId,
                content:`${name}님이 게시글에 댓글을 작성했습니다.`,
                postId:comment.postId,
                commentId:comment.id,
                clubId:post.clubId
            },{transaction:transaction})
        }
        //게시글 작성자에게 알람 - 자신이 댓글단 경우만 제외
        if (post.userId != comment.userId){
            const writer = await User.sequelize.query(
                `SELECT u.token FROM users u join club_users cu on u.id=cu.userId `+
                `WHERE u.id=${post.userId} and u.pushAlarm=true and cu.alarm=true and cu.clubId=${post.clubId}`,
                {transaction:transaction}
            )
            token[comment_user[0].length]= writer[0][0].token;
            await Alarm.create({
                userId: post.userId,
                content: `${name}님이 게시글에 댓글을 작성했습니다.`,
                postId: comment.postId,
                commentId: comment.id,
                clubId: post.clubId
            }, { transaction: transaction })
        }
        fcmPushGenerator(token,`${name}님이 게시글에 댓글을 작성했습니다.`,comment.id,"comment");
        await transaction.commit();
        res.status(200).send(comment);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});


//POSTMAN: 게시글 수정@
router.patch('/:postId',uploader.fields([{name:'banner'},{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        //(글 수정 -> 파일 DB 삭제 후 추가)->성공 시 스토리지의 이전 게시글 파일 삭제 
        transaction = await Post.sequelize.transaction();
        const post = await Post.update({
            isNotice:req.body.isNotice,
            isEvent:req.body.isEvent,
            text: req.body.text,
            participationFee: req.body.participationFee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        },{
            where:{id:req.params.postId},transaction:transaction
        });
        if(!updateRow(post).result) throw new Error(`Error:No post id:${req.params.postId}`);
        const prevFiles = await File.findAll({where:{postId:req.params.postId},transaction:transaction})
        await File.destroy({
            where:{postId:req.params.postId},transaction:transaction
        }).then(async(files)=>{
            if(req.body.isEvent===true){
                if(typeof req.files['banner']=='undefined'){
                    await transaction.rollback();//이벤트에서 배너 없을 경우 롤백
                    res.send("banner required")
                }else{
                    await File.create({postId:req.params.postId,type:"banner",name:req.files['banner'][0].filename},{transaction:transaction})
                }
            }
            if(typeof req.files['file']!='undefined'){
                for(var i=0; i<req.files['file'].length; i++)
                    await File.create({postId:req.params.postId,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
            }
            if(typeof req.files['image']!='undefined'){
                for(var i=0; i<req.files['image'].length; i++)
                    await File.create({postId:req.params.postId,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
            }
            if(typeof req.files['video']!='undefined'){
                for(var i=0; i<req.files['video'].length; i++)
                    await File.create({postId:req.params.postId,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
            }
        });
        const result = await Post.findOne({
            where:{id:req.params.postId},
            include:[{
                model:File,
                attributes:['name','type']
            }],transaction:transaction});
        await transaction.commit();
        for(var i=0; i<prevFiles.length; i++){
            fs.unlink(appDir + '/upload/' + prevFiles[i].name, (err) => {
                console.log(err);
            });
        }
        res.status(200).send(result);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 수정@
router.patch('/comment/:commentId',async(req,res,next)=>{
    try{
        const comment = await Comment.findOne({where:{id:req.params.commentId}});
        if(comment){
            comment.comment = req.body.comment;
            await comment.save();
            res.status(200).send(comment);
        }else{
            res.status(204).send();
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 게시글 좋아요@
router.patch('/:postId/like', async (req, res, next) => {
    try {
        await Like.findOrCreate({
            where: { postId: req.params.postId, userId: req.body.userId }
        }).then(async (result) => {
            if(result[1]){
                res.status(200).send(true)
            }else{
                await Like.destroy({
                    where: { postId: req.params.postId, userId: req.body.userId }
                });
                res.status(200).send(false)
            }
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 게시글 참여하기 클릭@
router.patch('/:postId/participation',async(req,res,next)=>{
    try {
        await Post_participation_user.findOrCreate({
            where: { postId: req.params.postId, userId: req.body.userId }
        }).then(async (result) => {
            if(result[1]){
                res.status(200).send(true)
            }else{
                await Post_participation_user.destroy({
                    where: { postId: req.params.postId, userId: req.body.userId }
                })
                res.status(200).send(false)
            }
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 특정 유저 금액 지불 클릭@
router.patch('/:postId/paid',async(req,res,next)=>{
    try{
        const user = await Post_participation_user.findOne({
            where: { postId: req.params.postId, userId: req.body.userId }
        });
        if(user){
            user.payment = !user.payment;
            await user.save();
            if(user.payment)
                res.status(200).send(true)
            else
                res.status(200).send(false)
        }else{
            res.status(204).send();
        }    
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 게시글 삭제@ onDelete:CASCADE, like,.. 등에 해당 postId 갖는 로우 모두 삭제됨
router.delete('/:postId',async(req,res,next)=>{
    try{
        const files = await File.findAll({
            where:{postId:req.params.postId}
        });
        for(var i=0; i<files.length; i++){
            fs.unlink(appDir + '/upload/' + files[i].name, (err) => {
                console.log(err);
            });
        }
        const result = await Post.destroy({
            where:{id:req.params.postId}
        })
        if(deleteRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 삭제@
router.delete('/comment/:commentId',async(req,res,next)=>{
    try{
        const result = await Comment.destroy({
            where:{id:req.params.commentId}
        })
        if(deleteRow(result).result)
            res.status(200).send(true);
        else
            res.status(204).send();
    }catch(err){
        console.error(err);
        next(err);
    }
});



module.exports = router;