const express = require("express")
const bodyParser = require("body-parser")

const server = express();

//서버로 받는 바디를 추출해 json 형태로 바꾸어줌
server.use(bodyParser.json())

const users = [
    {
        id:"asdfasdf",
        name:"Dave",
        age:17
    },
    {
        id:"fasffa",
        name:"Gong",
        age:17  
    }
]


//get 메소드로 api/user가 올 경우 users를 응답
server.get("/api/user",(req,res)=>{
    res.json(users);
})

//id로 특정 유저 반환. 주의점: express에서는 맨위에서부터 순차적으로 검사. 큰 목록부터 위에서
//:id는 request의 params(매개변수들) 중 id로 접근 가능
server.get("/api/user/:id",(req,res)=>{
    const user = users.find((u)=>{ //users 중에 params.id랑 같은걸 찾음
        return u.id === req.params.id;
    })
    if(user){
        res.json(user)
    }else{
        res.status(404).json({errorMessage:"There is no user."});
    }
})

server.post("/api/user",(req,res)=>{
    users.push(req.body);
    res.json(users);
})


//url로 id를 전달해주고 body에 바꾸고 싶은 필드를 적으면 업데이트됨
server.put("/api/user/:id",(req,res)=>{
    let index = users.findIndex(u=>u.id===req.params.id)
    if(index===-1){
        res.json({errorMesage:"Error"});
    }else{
        users[index] = {...users[index],...req.body};
        res.json(users[index]);
    }
})

server.delete("/api/user/:id",(req,res)=>{
    let index = users.findIndex(u=>u.id===req.params.id)
    if(index===-1){
        res.json({errorMesage:"Error"});
    }else{
        let foundUser = users.splice(index,1); //인덱스로 부터 한칸을 제거
        res.json(foundUser[0])
    }
})

server.listen(3000, ()=>{
    console.log("the server is running")
})