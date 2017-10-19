/**
 * Created by lailai on 2017/10/11.
 */
var koa=require('koa');
var path=require('path');
var bodyParser=require('koa-bodyparser');
var ejs=require('ejs');
var session=require('koa-session-minimal');
var MysqlStore=require('koa-mysql-session');
var config=require('./config/default.js');
var router=require('koa-router');
var views=require('koa-views');
var koaStatic=require('koa-static');
var app=new koa();
var server=require('http').Server(app.callback());
var io=require('socket.io').listen(server);
//session存储配置
const sessionMysqlConfig={
    user: config.database.USERNAME,
    password: config.database.PASSWORD,
    database: config.database.DATABASE,
    host: config.database.HOST
};
//配置session中间件
app.use(session({
    key: 'USER_SID',
    store: new MysqlStore(sessionMysqlConfig)
}));
//配置静态资源加载中间件
app.use(koaStatic(
    path.join(__dirname,'./public')
));
//配置服务端模板渲染引擎中间件
app.use(views(path.join(__dirname,'./views'),{extension: 'ejs'}));
//使用表单简析中间件
app.use(bodyParser());
//使用新建的路由文件
app.use(require('./routes/signup.js').routes());
app.use(require('./routes/signin.js').routes());
app.use(require('./routes/posts.js').routes());
app.use(require('./routes/signout.js').routes());
app.use(require('./routes/chat.js').routes());
app.use(require('./routes/yanhua.js').routes());
server.listen(config.port);//监听端口
console.log('listening on port '+config.port);
var users=[];
//socket部分
io.on('connection',function(socket){
    //接收并处理客服端发送的login事件
    socket.on('login',function(nickname){
        if(users.indexOf(nickname)>-1){
            socket.emit('nickExisted');
        }else{
            socket.userIndex=users.length;
            socket.nickname=nickname;
            users.push(nickname);
            socket.emit('loginSuccess');
            console.log(users.length);
            console.log(users);
            io.sockets.emit('system',nickname,users.length,'login');//向所有连接到服务器的客服端发送当前登录用户的昵称
        }
    });
    //断开连接的事件
    socket.on('disconnect',function(){
        users.splice(socket.userIndex,1);
        //通知除自己外的所有人
        socket.broadcast.emit('system',socket.nickname,users.length,'logout');
    });
    socket.on('postMsg',function(msg,color){
        socket.broadcast.emit('newMsg',socket.nickname,msg,color);
    });
    //接收用户发来的图片
    socket.on('img',function(imgData){
        socket.broadcast.emit('newImg',socket.nickname,imgData);
    });
});