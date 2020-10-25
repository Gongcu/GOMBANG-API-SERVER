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
const Sequelize = require('sequelize');
const Club_user = require('../models/club_user');
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
//POSTMAN:이벤트 게시글 조회@
router.get('/event',async(req,res,next)=>{
    try{
        const post = await Post.sequelize.query(`SELECT p.id, u.id uid,u.name , u.image, p.isNotice, p.isEvent, p.text, p.participation_fee, `+
            `p.title, p.color, p.startDate, p.endDate, p.place, p.memo, p.createdAt,COALESCE(l.count,0) as like_count,COALESCE(c.count,0) as comment_count ` +
            `FROM posts p left join (select pid, count(*) count from likes group by pid) l on p.id=l.pid left join (select pid, count(*) count from comments group by pid) c on p.id=c.pid join users u on p.uid = u.id ` +
            `WHERE p.isEvent=true`
        )   
        res.send(post[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:특정 동아리의 게시글 조회@
router.get('/:club_id',async(req,res,next)=>{
    try{
        const post = await Post.sequelize.query(`SELECT p.id, u.id uid,u.name , u.image, p.isNotice, p.isEvent, p.text, p.participation_fee, `+
            `p.title, p.color, p.startDate, p.endDate, p.place, p.memo, p.createdAt,COALESCE(l.count,0) as like_count,COALESCE(c.count,0) as comment_count ` +
            `FROM posts p left join (select pid, count(*) count from likes group by pid) l on p.id=l.pid left join (select pid, count(*) count from comments group by pid) c on p.id=c.pid join users u on p.uid = u.id ` +
            `WHERE p.club_id=${req.params.club_id}`
        )   
        res.send(post[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN:특정 게시글에 대한 자세한 조회@
router.get('/detail/:post_id',async(req,res,next)=>{
    try{
        var post = await Post.findOne({
            where:{id:req.params.post_id},
            raw:true
        });
        var files = await File.sequelize.query(
            `SELECT type, name `+
            `FROM files WHERE pid=${req.params.post_id}`
        )
        var likes = await Like.sequelize.query(
            `SELECT u.id, u.name, u.image `+
            `FROM likes l join users u on l.uid=u.id WHERE l.pid=${req.params.post_id}`
        )
        var comments = await Comment.sequelize.query(
            `SELECT u.id, u.name, u.image, c.comment, c.createdAt `+
            `FROM comments c join users u on c.uid=u.id WHERE c.pid=${req.params.post_id} order by c.createdAt asc`
        )
   
        var post_participation_users = await Comment.sequelize.query(
            `SELECT u.id, u.name, u.image, p.payment `+
            `FROM post_participation_user p join users u on p.uid=u.id WHERE p.pid=${req.params.post_id}`
        )
        post.Files=files[0];
        post.likes=likes[0];
        post.comments=comments[0];
        post.post_participation_users=post_participation_users[0];

        res.send(post);
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 특정 게시글의 댓글 조회@
router.get('/comment/:post_id',async(req,res,next)=>{
    try{
        const comments = await Comment.sequelize.query(
            `SELECT u.id, u.name, u.image, c.comment, c.createdAt `+
            `FROM comments c join users u on c.uid=u.id WHERE c.pid=${req.params.post_id} order by c.createdAt asc`
        )
        res.send(comments[0]);
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN:참가자 엑셀로 내보내기@
router.get('/participation/export/:post_id',async(req,res,next)=>{
    try{
        const post = await Post.findOne({where:{id:req.params.post_id}});
        const post_participation_users = await Comment.sequelize.query(
            `SELECT u.id, u.name, u.image, p.payment `+
            `FROM post_participation_user p join users u on p.uid=u.id WHERE p.pid=${req.params.post_id}`
        )
        const filename = post.id+"_"+post.title + " 참가 목록.xlsx";
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`참가자 명단`);
        sheet.columns = [
            {header:'이름',key:'name'},
            {header:'납부여부',key:'payment'}
        ]
        var list = post_participation_users[0];
        var i, paid_user_count=0;
        for( i=0; i<list.length; i++){
            if(list[i].payment){
                sheet.addRow({name:list[i].name,payment:"O"});
                paid_user_count++;
            }
            else
                sheet.addRow({name:list[i].name,payment:"X"});
        }
        sheet.addRow({name:'참가비',payment:post.participation_fee})
        sheet.addRow({name:'참가자 수',payment:list.length})
        sheet.addRow({name:'납부자 수',payment:paid_user_count})

        sheet.getRow(1).font = {bold:true} //첫 행: 컬럼 제목
        sheet.getRow(i+2).font = {bold:true} //참가비
        sheet.getRow(i+3).font = {bold:true} //참가자 수
        sheet.getRow(i+4).font = {bold:true} //납부자 수

        workbook.xlsx.writeFile(appDir+'/excel/'+filename).then(_=>{
            res.send(filename);
        }).catch((error)=>{
            console.log(error);
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
            uid: req.body.uid,
            club_id: req.body.club_id,
            text: req.body.text,
            isNotice:req.body.isNotice,
            participation_fee: req.body.participation_fee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        },{transaction:transaction});

        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({pid:post.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({pid:post.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({pid:post.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
        }
        const result = await Post.findOne({
            where:{id:post.id},
            include:[{
                model:File,
                attributes:['name','type']
            }],transaction:transaction});
        if(post.isNotice){
            const users = await Club_user.findAll({
                where:{uid:{[Sequelize.Op.not]:post.uid}}
            });
            for(var i=0; i<users.length; i++){
                await Alarm.create({
                    uid:users[i].id,
                    content:"새로운 공지사항이 등록되었습니다.",
                    pid:post.id,
                    club_id:post.club_id
                },{transaction:transaction});
            }
        }
        await transaction.commit();
        res.send(result);
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
            uid: req.body.uid,
            club_id: req.body.club_id,
            isNotice:req.body.isNotice,
            isEvent:true,
            text: req.body.text,
            participation_fee: req.body.participation_fee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        });
        await File.create({pid:post.id,type:"banner",name:req.files['banner'][0].filename},{transaction:transaction})
        if(typeof req.files['file']!='undefined'){
            for(var i=0; i<req.files['file'].length; i++)
                await File.create({pid:post.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['image']!='undefined'){
            for(var i=0; i<req.files['image'].length; i++)
                await File.create({pid:post.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
        }
        if(typeof req.files['video']!='undefined'){
            for(var i=0; i<req.files['video'].length; i++)
                await File.create({pid:post.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
        }
        const result = await Post.findOne({
            where:{id:post.id},
            include:[{
                model:File,
                attributes:['name','type']
            }],transaction:transaction});
        //작성자 빼고 모두 알람
        const users = await User.findAll({
            where:{id:{[Sequelize.Op.not]:req.body.uid}}
        });
        for(var i=0; i<users.length; i++){
            await Alarm.create({
                uid:users[i].id,
                content:"새로운 이벤트가 생성되었습니다.",
                pid:post.id
            },{transaction:transaction});
        }
        await transaction.commit();
        res.send(result);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 작성@ +PUSH
router.post('/comment/:post_id',async(req,res,next)=>{
    let transaction;
    try{
        transaction = await Comment.sequelize.transaction();
        //1. content에 사용될 name 추출
        const post = await Post.findOne({
            where:{id:req.params.post_id},transaction:transaction
        })
        let name;
        if(post.isEvent){
            const user = await User.findOne({
                where:{id:req.body.uid},attributes:['name'],transaction:transaction
            });
            name=user.name;
        }else{
            const club_user = await Club_user.findOne({
                where:{uid:req.body.uid},attributes:['nickname'],transaction:transaction
            })
            name=club_user.nickname;
        }

        //댓글 작성
        const comment = await Comment.create({
            pid:req.params.post_id,
            uid:req.body.uid,
            comment: req.body.comment,
        },{transaction:transaction});
        

        //알람 보낼 유저들 선정 - (댓글 작성자/게시글작성자 제외, 게시글 작성자는 아래서 따로 호출하기 때문)
        const comment_user = await Comment.findAll({
            where:{pid:req.params.post_id, uid:{[Sequelize.Op.not]:post.uid}, uid:{[Sequelize.Op.not]:req.body.uid}},
            attributes:[[Sequelize.fn('DISTINCT',Sequelize.col('uid')),'uid']],
            transaction:transaction
        });

        //알람
        for(var i=0; i<comment_user.length; i++){
            await Alarm.create({
                uid:comment_user[i].uid,
                content:`${name}님이 게시글에 댓글을 작성했습니다.`,
                pid:comment.pid,
                comment_id:comment.id,
                club_id:post.club_id
            },{transaction:transaction})
        }
        //게시글 작성자에게 알람 - 자신이 댓글단 경우만 제외
        if (post.uid != comment.uid)
            await Alarm.create({
                uid: post.uid,
                content: `${name}님이 게시글에 댓글을 작성했습니다.`,
                pid: comment.pid,
                comment_id: comment.id,
                club_id: post.club_id
            }, { transaction: transaction })
        await transaction.commit();
        res.send(comment);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});


//POSTMAN: 게시글 수정@
router.patch('/:id',uploader.fields([{name:'banner'},{name:'file'},{name:'image'},{name:'video'}]),async(req,res,next)=>{
    let transaction;
    try{
        //(글 수정 -> 파일 DB 삭제 후 추가)->성공 시 스토리지의 이전 게시글 파일 삭제 
        transaction = await Post.sequelize.transaction();
        await Post.update({
            isNotice:req.body.isNotice,
            isEvent:req.body.isEvent,
            text: req.body.text,
            participation_fee: req.body.participation_fee,
            title: req.body.title,
            color: req.body.color,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            place: req.body.place,
            memo: req.body.memo,
        },{
            where:{id:req.params.id},transaction:transaction
        });
        const prevFiles = await File.findAll({where:{pid:req.params.id},transaction:transaction})
        await File.destroy({
            where:{pid:req.params.id},transaction:transaction
        }).then(async(files)=>{
            if(req.body.isEvent===true){
                if(typeof req.files['banner']=='undefined'){
                    await transaction.rollback();//이벤트에서 배너 없을 경우 롤백
                    res.send("banner required")
                }else{
                    await File.create({pid:req.params.id,type:"banner",name:req.files['banner'][0].filename},{transaction:transaction})
                }
            }
            if(typeof req.files['file']!='undefined'){
                for(var i=0; i<req.files['file'].length; i++)
                    await File.create({pid:req.params.id,type:"file",name:req.files['file'][i].filename},{transaction:transaction})
            }
            if(typeof req.files['image']!='undefined'){
                for(var i=0; i<req.files['image'].length; i++)
                    await File.create({pid:req.params.id,type:"image",name:req.files['image'][i].filename},{transaction:transaction})
            }
            if(typeof req.files['video']!='undefined'){
                for(var i=0; i<req.files['video'].length; i++)
                    await File.create({pid:req.params.id,type:"video",name:req.files['video'][i].filename},{transaction:transaction})
            }
        })
        const result = await Post.findOne({
            where:{id:req.params.id},
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
        res.send(result);
    }catch(err){
        if(transaction) await transaction.rollback();
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 수정@
router.patch('/comment/:comment_id',async(req,res,next)=>{
    try{
        const comment = await Comment.findOne({where:{id:req.params.comment_id}});
        if(comment){
            comment.comment = req.body.comment;
            await comment.save();
            res.send(comment);
        }else{
            res.send(updateRow(0))
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 게시글 좋아요@
router.patch('/like/:post_id', async (req, res, next) => {
    try {
        await Like.findOrCreate({
            where: { pid: req.params.post_id, uid: req.body.uid }
        }).then(async (result) => {
            if(result[1]){
                res.send("on")
            }else{
                await Like.destroy({
                    where: { pid: req.params.post_id, uid: req.body.uid }
                })
                res.send("off")
            }
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 게시글 참여하기 클릭@
router.patch('/participation/:post_id',async(req,res,next)=>{
    try {
        await Post_participation_user.findOrCreate({
            where: { pid: req.params.post_id, uid: req.body.uid }
        }).then(async (result) => {
            if(result[1]){
                res.send("on")
            }else{
                await Post_participation_user.destroy({
                    where: { pid: req.params.post_id, uid: req.body.uid }
                })
                res.send("off")
            }
        })
    } catch (err) {
        console.error(err);
        next(err);
    }
});

//POSTMAN: 특정 유저 금액 지불 클릭@
router.patch('/paid/:post_id',async(req,res,next)=>{
    try{
        const user = await Post_participation_user.findOne({
            where: { pid: req.params.post_id, uid: req.body.uid }
        });
        user.payment = !user.payment;
        await user.save();
        if(user.payment)
            res.send("on");
        else
            res.send("off");
    }catch(err){
        console.error(err);
        next(err);
    }
});


//POSTMAN: 게시글 삭제@ onDelete:CASCADE, like,.. 등에 해당 pid 갖는 로우 모두 삭제됨
router.delete('/:id',async(req,res,next)=>{
    try{
        const files = await File.findAll({
            where:{pid:req.params.id}
        });
        for(var i=0; i<files.length; i++){
            fs.unlink(appDir + '/upload/' + files[i].name, (err) => {
                console.log(err);
            });
        }
        const result = await Post.destroy({
            where:{id:req.params.id}
        })
        res.send(deleteRow(result))
    }catch(err){
        console.error(err);
        next(err);
    }
});

//POSTMAN: 댓글 삭제@
router.delete('/comment/:comment_id',async(req,res,next)=>{
    try{
        const result = await Comment.destroy({
            where:{id:req.params.comment_id}
        })
        res.send(deleteRow(result))
    }catch(err){
        console.error(err);
        next(err);
    }
});



module.exports = router;