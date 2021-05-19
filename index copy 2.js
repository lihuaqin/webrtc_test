var app = require('express')();
var http = require('http').createServer(app);
const fs = require('fs');
const https = require('https');
const url = require('url')



let sslOptions = {
     key: fs.readFileSync('C:/privkey.key'),//里面的文件替换成你生成的私钥
     cert: fs.readFileSync('C:/cacert.pem')//里面的文件替换成你生成的证书
};

var server = https.createServer(sslOptions, app);
var io = require('socket.io')(server);
console.log("https server listens on port 8080...");

server.listen(8080);

app.get('/test', function (req, res) {
    // var response = "Hello World";
    
    res.sendFile(__dirname + '/index.html');
    // var response = JSON.stringify(process.env);
    // res.send(response);
    // res.send(response);
  });

    
app.get('/' , (req , res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/camera' , (req , res) => {
    res.sendFile(__dirname + "/camera.html");
});


var io = require('socket.io')(https);

io.on("connection",(socket) => {
    console.log("a user connected: " + socket.id);
    socket.on("disconnect" , () => {
        console.log("user dicconnected: " + socket.id)
    });
    socket.on("chat message", (msg) => {
        console.log(socket.id + "say: " + msg);
        //io.emit("chat message",msg); //将消息发送给所有连接的用户
        socket.broadcast.emit("chat message" , msg); //把消息发送给除自己（发送消息的人）之外的其他人
    });


})


http.listen(3000, () =>{
    console.log("listen on : 3000");
})
