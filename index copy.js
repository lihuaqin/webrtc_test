var app = require('express')();
var http = require('http').createServer(app);
const fs = require('fs');
const https = require('https');
const url = require('url')



let sslOptions = {
     key: fs.readFileSync('C:/privkey.key'),//里面的文件替换成你生成的私钥
     cert: fs.readFileSync('C:/cacert.pem')//里面的文件替换成你生成的证书
};


// https.createServer(sslOptions, (req, res) => {
//     var url = res.url;
//       console.log(url);
//     res.writeHead(200);
//     res.end('<body>aaa</body>');
//   }).listen(8080,function(){
//       console.log('请打开浏览器访问：https://localhost:8080');
//   });

    
    
app.get('/' , (req , res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get('/camera' , (req , res) => {
    res.sendFile(__dirname + "/camera.html");
});

// const https = require('https').createServer(sslOptions, app);
https.createServer(sslOptions,function(req,res){
    var pathname = url.parse(req.url).pathname;
    if(pathname == '/') {
        pathname = '/index.html';
    }
    // 读取文件，并设置为html类型，返回给浏览器
    fs.readFile(__dirname + pathname, function (err, data) {
        if (err) {
        if(pathname == '/favicon.ico') {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8;'});
            res.end();
        }
        console.error(err);
        res.writeHead(404, {'Content-Type': 'text/html'});
        } else {
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8;'});
        res.write(data.toString());
        }
        res.end();
    });
    // res.writeHead(200);
    // res.end(app.callback());
  }).listen(8080,function(){
        console.log('请打开浏览器访问：https://localhost:8080');
  });
var io = require('socket.io')(https);

io.on("connection",(socket) => {
    console.log("a user connected: " + socket.id);
    socket.on("disconnect" , () => {
        console.log("user dicconnected: " + socket.id)
        //某个用户断开连接的时候，我们需要告诉所有还在线的用户这个信息
        socket.broadcast.emit('user disconnected' , socket.id);
    });
    socket.on("chat message", (msg) => {
        console.log(socket.id + "say: " + msg);
        //io.emit("chat message",msg); //将消息发送给所有连接的用户
        socket.broadcast.emit("chat message" , msg); //把消息发送给除自己（发送消息的人）之外的其他人
    });


})



// https.listen(443, () => {
//     console.log('https listen on');
// });

http.listen(3000, () =>{
    console.log("listen on : 3000");
})
