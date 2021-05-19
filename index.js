var app = require('express')();
var http = require('http').createServer(app);
const fs = require('fs');
const url = require('url')



let sslOptions = {
     key: fs.readFileSync('C:/privkey.key'),//里面的文件替换成你生成的私钥
     cert: fs.readFileSync('C:/cacert.pem')//里面的文件替换成你生成的证书
};

const https = require('https').createServer(sslOptions, app);
 
app.get('/' , (req , res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/camera' , (req , res) => {
    res.sendFile(__dirname + "/camera.html");
});


var io = require('socket.io')(https);

io.on("connection",(socket) => {
    //连接加入子房间
    socket.join(socket.id);
    console.log("a user connected: " + socket.id);
    socket.on("disconnect" , () => {
        console.log("user dicconnected: " + socket.id);
        socket.broadcast.emit('user disconnected', socket.id);
    });
    socket.on("chat message", (msg) => {
        console.log(socket.id + "say: " + msg);
        //io.emit("chat message",msg); //将消息发送给所有连接的用户
        socket.broadcast.emit("chat message" , msg); //把消息发送给除自己（发送消息的人）之外的其他人
    });

    //当有新用户加入，打招呼时，需要转发消息到所有在线用户。
    socket.on('new user greet', (data) => { 
        console.log(data); 
        console.log(socket.id + ' greet ' + data.msg); 
        socket.broadcast.emit('need connect', {sender: socket.id, msg : data.msg}); 
    });

    //在线用户回应新用户消息的转发
    socket.on('ok we connect', (data) => {
        debugger
        console.log('ok we connect-receiver:' + data.receiver +'  sender:' + data.sender); 
        io.to(data.receiver).emit('ok we connect', {sender : data.sender});
    })
    //sdp 消息的转发
    socket.on( 'sdp', ( data ) => {
        console.log('sdp');
        console.log(data.description);
        socket.to( data.to ).emit('sdp' , {
            description : data.description,
            sender : data.sender
        });
    });

    //candidates 消息的转发
    socket.on('ice candidates' , (data ) => {
        console.log('ice candidates: ');
        console.log(data);
        socket.to(data.to).emit('ice candidates' , {
            candidate: data.candidate,
            sender: data.sender
        });
    });

})
https.listen(8080, () => {
    console.log('https listen on');
});

http.listen(3000, () =>{
    console.log("listen on : 3000");
})
